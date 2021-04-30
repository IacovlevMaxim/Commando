const { oneLine } = require('common-tags');
const { MessageEmbed } = require('discord.js');
const Command = require('../base');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'util',
			memberName: 'ping',
			description: 'Checks the bot\'s ping to the Discord server.',
			throttling: {
				usages: 5,
				duration: 10
			}
		});
	}

	async run(msg) {
		const pingMsg = await msg.say({
			embed: new MessageEmbed()
				.setColor('YELLOW')
				.setDescription('Pinging...')
		});
		return pingMsg.edit({
			embed: new MessageEmbed()
				.setColor('GREEN')
				.setDescription(oneLine`
				${msg.channel.type !== 'dm' ? `${msg.author},` : ''}
				Pong! The message round-trip took ${
					(pingMsg.editedTimestamp || pingMsg.createdTimestamp) - (msg.editedTimestamp || msg.createdTimestamp)
				}ms.
				${this.client.ws.ping ? `The heartbeat ping is ${Math.round(this.client.ws.ping)}ms.` : ''}
			`)
		});
	}
};
