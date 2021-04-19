const Eris = require('eris');
const Logger = require('@developmentcubed/logger');
const Constants = require('./Constants');

/**
 * Wrapper class
 *
 * @class Client
 * @extends {Eris.Client}
 */
class Wrapper extends Eris.Client {
	/**
	 * Creates an instance of Wrapper.
	 * @param {Object} options
	 * @param {string} options.token - Discord API bot token
	 * @param {Eris.ClientOptions} options.options - Options to pass to Eris
	 * @param {string} options.prefix - Default prefix
	 * @param {any} options.commands
	 * @param {any} options.events
	 * @param {function} [options.getPrefix=null] - Function to get a prefix from a database
	 * @param {any} options.context - Context object to pass to events and commands
	 * @param {string} options.owners - Owners of the bot
	 * @memberof Wrapper
	 */
	constructor({
		token,
		options,
		prefix,
		commands,
		events,
		getPrefix = null,
		context,
		owners,
	}) {
		super(token, options);
		this.logger = new Logger();

		this.getPrefix = getPrefix;
		this.commands = commands;
		this.prefix = prefix;

		this.context = context;
		this.owners = owners;

		this.cooldowns = {};

		for (const name in events) {
			const event = events[name];
			this.on(event.event, (...args) => event.handle(this, context, ...args));
		}

		this.on('messageCreate', this.handleMessage);
	}

	/**
	 * Update the context that gets passed to commands and events
	 *
	 * @param {*} context
	 * @memberof Wrapper
	 */
	updateContext(context) {
		this.context = context;
	}

	/**
	 * Parse a message for a command
	 *
	 * @param {Eris.Message} event
	 * @return {import('./Command').CommandObject}
	 * @memberof Wrapper
	 */
	async parseCommand(event) {
		const command = event;

		command.params = event.content.split(' ');

		if (command.params?.length) {
			for (let i = 0; i < command.params.length; i++) {
				if (!command.params[i].trim().length) command.params.splice(i, 1);
				if (command.params[i]) command.params[i] = command.params[i].trim();
			}
		}

		if (this.parseID(command.params[0]) === this.user.id) {
			command.prefix = `@${this.user.username} `;
			[, command.command] = command.params.splice(0, 2);
		} else if (command.params[0].startsWith(this.prefix)) {
			command.command = command.params[0].substring(
				this.prefix.length,
				command.params[0].length,
			);
			if (!command.command.length) return null;
			command.prefix = this.prefix;
			command.params.splice(0, 1);
		} else if (this.getPrefix && event.guildID) {
			const prefix = await this.getPrefix(event.guildID);
			if (command.params[0].startsWith(prefix)) {
				command.command = command.params[0].substring(
					prefix.length,
					command.params[0].length,
				);
				if (!command.command.length) return null;
				command.prefix = prefix;
				command.params.splice(0, 1);
			}
		}

		if (!command.prefix || !command.command) return null;

		if (command.channel.guild) command.guild = command.channel.guild;
		command.userTag = `${command.author.username}#${command.author.discriminator}`;

		return command;
	}

	/**
	 * Handle a message
	 *
	 * @param {Eris.Message} event
	 * @memberof Wrapper
	 */
	async handleMessage(event) {
		if (event.author.bot) return;

		const commandObject = await this.parseCommand(event);
		if (!commandObject) return;

		for (const commandName in this.commands) {
			if (!this.commands.hasOwnProperty(commandName)) continue;

			/** @type {import('./Command')} */
			const command = this.commands[commandName];

			if (
				command.command !== commandObject.command &&
				!command.aliases.includes(commandObject.command)
			)
				continue;

			if (!command.enabled) return;

			if (!command.allowDM && !event.channel.guild?.id)
				return this.sendMessage(commandObject, {
					embed: {
						title: 'Uh Oh',
						description: `This command can't be used in DMs.`,
						color: Constants.colours.embedGray,
					},
				});

			if (command.ownerOnly && !this.owners.includes(event.author.id))
				return this.sendMessage(commandObject, {
					embed: {
						title: 'Missing Permission',
						description: `You're missing the following permission:`,
						color: Constants.colours.embedGray,
						fields: [
							{
								name: Constants.permissions.botOwner.name,
								value: Constants.permissions.botOwner.description,
							},
						],
					},
				});

			if (command.userPermissions.length) {
				const missingPermissions = this.checkUserPermissions(
					event.member,
					command.userPermissions,
				);
				if (missingPermissions.length)
					return this.sendMessage(commandObject, {
						embed: {
							title: 'Missing Permissions',
							description: `You're missing the following permissions:`,
							color: Constants.colours.embedGray,
							fields: missingPermissions.map((permission) => ({
								name: Constants.permissions[permission].name,
								value: Constants.permissions[permission].description,
							})),
						},
					});
			}

			if (command.botPermissions.length) {
				const missingPermissions = this.checkUserPermissions(
					commandObject.guild.members.get(this.user.id),
					command.botPermissions,
				);
				if (missingPermissions.length)
					return this.sendMessage(commandObject, {
						embed: {
							title: 'Missing Permissions',
							description: `I'm missing the following permissions:`,
							color: Constants.colours.embedGray,
							fields: missingPermissions.map((permission) => ({
								name: Constants.permissions[permission].name,
								value: Constants.permissions[permission].description,
							})),
						},
					});
			}

			if (
				command.params.filter(
					(param, index) => !param.optional && !commandObject.params[index],
				).length
			) {
				return this.sendMessage(commandObject, {
					embed: {
						title: 'Incorrect Usage',
						description: `Please refer to **${commandObject.prefix}help ${command.command}** for proper usage`,
						color: Constants.colours.embedGray,
					},
				});
			}

			if (command.cooldown) {
				if (this.cooldowns[`${event.author.id}:${command.command}`]) {
					const cooldown = this.cooldowns[
						`${event.author.id}:${command.command}`
					];
					return this.sendMessage(commandObject, {
						embed: {
							title: 'Command Cooldown',
							description: `Please try again in **${(
								(cooldown.time - new Date()) /
								1000
							).toFixed(1)} seconds**`,
							color: Constants.colours.embedGray,
						},
					});
				} else
					this.cooldowns[`${event.author.id}:${command.command}`] = {
						time: new Date().getTime() + command.cooldown * 1000,
						del: setTimeout(() => {
							delete this.cooldowns[`${event.author.id}:${command.command}`];
						}, command.cooldown * 1000),
					};
			}

			try {
				this.logger.info(
					`${event.guildID} ${event.author.id} ${commandObject.userTag}: ${event.content}`,
				);
				command.handle(this, commandObject, this.context);
			} catch (error) {
				this.logger.error(
					`${event.guildID} ${event.author.id} ${
						commandObject.userTag
					}: ${error.toString()}`,
				);
			}
		}
	}

	parseID(content) {
		return content?.replace(/\D+/g, '');
	}

	/**
	 * Sanitize a message removing formatting and mentions
	 * @param {string} content
	 * @param {boolean} [mentions=true]
	 * @returns {string}
	 * @memberof Wrapper
	 */
	sanitizeString(content, mentions = true) {
		content = content
			.replace(/~/g, '\u200B~')
			.replace(/\*/g, '\u200B*')
			.replace(/_/g, '\u200B_')
			.replace(/`/g, '\u02CB')
			.replace(/\|/g, '\u200B|');
		if (mentions)
			content = content.replace(/@/g, '@\u200B').replace(/#/g, '#\u200B');
		return content;
	}

	/**
	 * Send a message to a channel
	 *
	 * @param {import('./Command').CommandObject | String} command
	 * @param {Eris.MessageContent} content
	 * @param {boolean} [returnError=false]
	 * @returns {Promise<Eris.Message>}
	 * @memberof Wrapper
	 */
	sendMessage(command, content, returnError = false) {
		return new Promise(async (resolve, reject) => {
			try {
				const channel =
					typeof command === 'object' ? command.channel.id : command;

				const message = await this.createMessage(channel, content);
				resolve(message);
			} catch (error) {
				if (returnError) reject(error);
			}
		});
	}

	/**
	 * Check if a user is missing permissions
	 *
	 * @param {Eris.Member} user
	 * @param {string[]} permissions
	 * @returns {string[]}
	 * @memberof Wrapper
	 */
	checkUserPermissions(user, permissions) {
		if (!user) return permissions;
		const missing = [];
		for (const permission of permissions) {
			if (!user.permissions.json[permission]) missing.push(permission);
		}
		return missing;
	}

	/**
	 * Check if the bot is missing any permissions in a channel
	 *
	 * @param {Eris.Channel} channel
	 * @param {string[]} permissions
	 * @return {string[]}
	 * @memberof Wrapper
	 */
	checkChannelPermissions(channel, permissions) {
		if (!channel) return ['Unknown Channel'];
		const missing = [];
		for (const permission of permissions) {
			if (!channel.permissionsOf(this.bot.user.id).has(permission))
				missing.push(permission);
		}
		return missing;
	}

	/**
	 * Check if the bot can send messages to the channel
	 *
	 * @param {Eris.Channel} channel
	 * @return {*}
	 * @memberof Wrapper
	 */
	canSendMessage(channel) {
		return !this.checkChannelPermissions(channel, [
			'readMessages',
			'sendMessages',
			'readMessageHistory',
			'embedLinks',
		]).length;
	}

	/**
	 * Check if the bot has a higher role
	 *
	 * @param {Eris.Guild} guild
	 * @param {number} rolePosition
	 * @returns {boolean}
	 * @memberof Wrapper
	 */
	checkRolePosition(guild, rolePosition) {
		const botRoles = guild.members.get(this.bot.user.id).roles;
		const maxPosition = Math.max.apply(
			Math,
			botRoles.map((r) => {
				return guild.roles.get(r).position;
			}),
		);
		if (!botRoles.length || rolePosition >= maxPosition) {
			return false;
		} else return true;
	}

	/**
	 * Check if user1 can edit user2
	 *
	 * @param {Eris.Guild} guild
	 * @param {Eris.Member} user1
	 * @param {Eris.Member} user2
	 * @returns {boolean}
	 * @memberof Wrapper
	 */
	compareUserRolePositions(guild, user1, user2) {
		const user1High = Math.max.apply(
			Math,
			user1.roles.map((r) => {
				return guild.roles.get(r).position;
			}),
		);
		const user2High = user2.roles
			? Math.max.apply(
					Math,
					user2.roles.map((r) => {
						return guild.roles.get(r).position;
					}),
			  )
			: 0;

		if (user1High > user2High) {
			return true;
		} else return false;
	}
}

module.exports = Wrapper;
