/**
 * Event base class
 *
 * @class Event
 */
class Event {
	/**
	 * Creates an instance of Event.
	 * @memberof Event
	 */
	constructor() {
		this.event = 'messageCreate';

		this.enabled = false;
	}

	/**
	 * Execute the command
	 *
	 * @param {import("./Wrapper")} caller
	 * @param {any} context
	 * @param {any} event
	 * @memberof Command
	 */
	async handle(caller, context, event) {
		if (!this.enabled) return;
	}
}

module.exports = Event;
