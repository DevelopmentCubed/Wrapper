/**
 * @typedef {Object} CommandBase
 * @property {string} command
 * @property {string} prefix
 * @property {string[]} params
 * @property {import('eris').Guild} guild
 * @property {string} userTag
 *
 * @typedef {import('eris').Message & CommandBase} CommandObject
 */

/**
 * Command base class
 *
 * @class Command
 */
class Command {
	/**
	 * Creates an instance of Command.
	 * @memberof Command
	 */
	constructor() {
		this.command = 'template';
		this.aliases = [];

		this.enabled = false;
		this.showOnHelp = false;
		this.ownerOnly = false;
		this.allowDM = false;
		this.userPermissions = [];
		this.botPermissions = [];

		this.helpDescription = '';
		this.params = [];

		this.cooldown = 0;
	}

	/**
	 * Execute the command
	 *
	 * @param {import("./Wrapper")} caller
	 * @param {CommandObject} command
   * @param {any} context
	 * @memberof Command
	 */
	async handle(caller, command, context) {
		if (!this.enabled) return;
	}
}

module.exports = Command;