class Constants {
	constructor() {
		this.colors = this.colours = {
			blue: 3447003,
			green: 7271027,
			yellow: 16775040,
			red: 16737075,
			blurple: 7506394,
			lightCyan: 8909549,
			embedGray: 3092790,
			gold: 16766720,
		};

		this.permissions = {
			readMessages: {
				name: 'Read Messages',
				description: 'Read Messages is needed in order to watch messages for reactions.',
			},
			readMessageHistory: {
				name: 'Read Message History',
				description: 'Read Message History is needed to be able to watch messages that have been previously sent.',
			},
			sendMessages: {
				name: 'Send Messages',
				description: 'Send Messages is needed to be able to send messages to the channel.',
			},
			embedLinks: {
				name: 'Embed Links',
				description: 'Embed Links is needed in order to send an embed to the channel.',
			},
			addReactions: {
				name: 'Add Reactions',
				description: 'Add Reactions is needed in order to add reactions to messages.',
			},
			externalEmojis: {
				name: 'External Emojis',
				description: 'External Emojis is needed if you want to use emojis from outside this server.',
			},
			manageMessages: {
				name: 'Manage Messages',
				description: 'Manage Messages is needed in order to remove users reactions from a message.',
			},
			manageRoles: {
				name: 'Manage Roles',
				description: "Manage Roles is needed in order to give or take roles from users. It's also needed to create roles.",
			},
			manageChannels: {
				name: 'Manage Channels',
				description: 'Manage Channels is needed in order to create and delete channels.',
			},
			botOwner: {
				name: 'Bot Owner',
				description: 'You need to be the bot owner to run this command.',
			},
			banMembers: {
				name: 'Ban Members',
				description: 'Ban Members is needed in order to ban or unban a user.',
			},
			createInstantInvite: {
				name: 'Create Invite',
				description: 'Create Invite is needed in order to create invites.',
			},
			kickMembers: {
				name: 'Kick Members',
				description: 'Kick Members is needed to kick members out of the server.',
			},
			administrator: {
				name: 'Administrator',
				description: 'Administrator gives all permissions.',
			},
			manageGuild: {
				name: 'Manage Server',
				description: 'Manage Server is required to make changes to the server.',
			},
			viewAuditLogs: {
				name: 'View Audit Logs',
				description: 'View Audit Logs is needed to check for bans and such.',
			},
			voicePrioritySpeaker: {
				name: 'Priority Speaker',
				description: 'Priority Speaker allows to be heard better.',
			},
			stream: {
				name: 'Stream',
				description: 'Stream is needed to do video sharing in a channel.',
			},
			sendTTSMessages: {
				name: 'Send TTS Messages',
				description: 'Send TTS Messages is needed in order to send TTS messages.',
			},
			attachFiles: {
				name: 'Attach Files',
				description: 'Attach Files is needed to upload files to a channel.',
			},
			mentionEveryone: {
				name: 'Mention Everyone',
				description: 'Mention Everyone is needed to ping @everyone or @here',
			},
			voiceConnect: {
				name: 'Voice Connect',
				description: 'Voice Connect is needed to connect to voice channels.',
			},
			voiceSpeak: {
				name: 'Voice Speak',
				description: 'Voice Speak is needed to speak in channels.',
			},
			voiceMuteMembers: {
				name: 'Voice Mute Members',
				description: 'Voice Mute Members is needed to mute members in voice channels.',
			},
			voiceDeafenMembers: {
				name: 'Voice Deafen Members',
				description: 'Voice Deafen Members is needed to deafen members.',
			},
			voiceMoveMembers: {
				name: 'Voice Move Members',
				description: 'Voice Move Members is needed to move users between channels.',
			},
			changeNickname: {
				name: 'Change Nickname',
				description: 'Change Nickname is needed to change my nickname.',
			},
			manageNicknames: {
				name: 'Manage Nicknames',
				description: 'Manage Nicknames is needed in order to change or remove nicknames from members.',
			},
			manageWebhooks: {
				name: 'Manage Webhooks',
				description: 'Manage Webhooks is needed to create, edit, and delete webhooks.',
			},
			manageEmojis: {
				name: 'Manage Emojis',
				description: 'Manage Emojis is needed to create, rename, or delete emojis.',
			},
		};

		this.interactionCallbackType = {
			PONG: 1,
			CHANNEL_MESSAGE_WITH_SOURCE: 4,
			DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE: 5,
			DEFERRED_UPDATE_MESSAGE: 6,
			UPDATE_MESSAGE: 7,
		};

		this.buttonStyles = {
			blurple: 1,
			grey: 2,
			green: 3,
			red: 4,
			link: 5,
		};
	}

	/**
	 * Create an interaction button object
	 *
	 * @param {string} label - Button text user gets to see
	 * @param {'blurple' | 'grey' | 'green' | 'red'} style - Style or color of button
	 * @param {string} [ID=null] - Custom ID of button.
	 * @param {string} [URL=null] - URL of button
	 * @return {*}
	 * @memberof Constants
	 */
	createButton(label, style, ID = null, URL = null) {
		if (!label || !style || (!ID && !URL)) return new Error('Invalid button params.');
		if (!this.buttonStyles[style]) style = 'blurple';

		if (ID)
			return {
				type: 2,
				label,
				style: this.buttonStyles[style],
				custom_id: ID,
			};

		if (URL)
			return {
				type: 2,
				label,
				style: this.buttonStyles.link,
				url: URL,
			};
	}

	/**
	 * Create an interactive selection menu
	 *
	 * @param {string} ID - Custom ID for this select menu
	 * @param {string} placeholder - Text shown to user when they haven't selected anything
	 * @param {number} min - Minimum amount of options the user has to select
	 * @param {number} max - Maximum amount of options the user can select
	 * @param {object[]} options - Option objects
	 * @return {*}
	 * @memberof Constants
	 */
	createSelectMenu(ID, placeholder, min, max, options) {
		if (!ID || !placeholder || isNaN(parseInt(min)) || isNaN(parseInt(max)) || !options.length) return new Error('Invalid select params.');
		min = parseInt(min);
		max = parseInt(max);

		return {
			type: 3,
			custom_id: ID,
			placeholder,
			min_values: min,
			max_values: max,
			options,
		};
	}

	/**
	 * Create select menu item
	 *
	 * @param {string} label - Label the user see
	 * @param {string} value - Value for item
	 * @param {string} description - Description user gets to see
	 * @param {string} [emoji=null] - Custom emoji or unicode Discord emoji.
	 * @return {*}
	 * @memberof Constants
	 */
	createMenuItem(label, value, description, emoji = null) {
		if (!label || !value || !description) return new Error('Invalid option params');
		if (emoji) {
			const cleaned = emoji.replace(/(<:)|(<)|(>)/g, '');
			const split = cleaned.split(':');
			emoji = {};
			if (split[0] === 'a') {
				emoji.animated = true;
				split.splice(0, 1);
			}
			emoji.name = split[0];
			emoji.id = split[1] ?? null;
		}

		return {
			label,
			value,
			description,
			emoji,
		};
	}
}

module.exports = new Constants();
