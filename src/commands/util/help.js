const { stripIndents, oneLine } = require('common-tags');
const Command = require('../base');
const { MessageEmbed } = require('discord.js');
const { disambiguation } = require('../../util');

module.exports = class HelpCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'help',
			group: 'util',
			memberName: 'help',
			aliases: ['commands'],
			description: 'Displays a list of available commands, or detailed information for a specified command.',
			details: oneLine`
				The command may be part of a command name or a whole command name.
				If it isn't specified, all available commands will be listed.
			`,
			examples: ['help', 'help prefix'],
			guarded: true,

			args: [
				{
					key: 'command',
					prompt: 'Which command would you like to view the help for?',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) { // eslint-disable-line complexity
		const groups = this.client.registry.groups;
		const commands = this.client.registry.findCommands(args.command, false, msg);
		const showAll = args.command && args.command.toLowerCase() === 'all';
		if(args.command && !showAll) {
			if(commands.length === 1) {
				let help = stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}

					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) help += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) help += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.replyEmbed(
						new MessageEmbed()
							.setColor('YELLOW')
							.setTitle(`Help with ${msg.client.user.username}`)
							.setDescription(help))
					);
					if(msg.channel.type !== 'dm') messages.push(await msg.replyEmbed(
						new MessageEmbed()
							.setColor('YELLOW')
							.setDescription("Emergency help pack was sent to DMs!")
					));
				} catch(err) {
					messages.push(await msg.replyEmbed(
						new MessageEmbed()
							.setColor('RED')
							.setDescription('Door to your DMs was closed. You probably have DMs disabled.')
					));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.replyEmbed(
					new MessageEmbed()
						.setColor('RED')
						.setDescription('Multiple commands found. Please be more specific.')
				);
			} else if(commands.length > 1) {
				return msg.replyEmbed(
					new MessageEmbed()
						.setColor('BLUE')
						.setDescription(disambiguation(commands, 'commands'))
				);
			} else {
				return msg.reply(
					`Unable to identify command. Use ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} to view the list of all commands.`
				);
			}
		} else {
			const messages = [];
			try {
				messages.push(
					await msg.say({
					embed: new MessageEmbed()
						.setTitle(`Help with ${msg.client.user.username}`)
						.setColor('YELLOW')
						.setThumbnail((msg.client.user.displayAvatarURL({format: "png", size: 2048})))
						.setDescription(stripIndents`
							${oneLine`
								To run a command in ${msg.guild ? msg.guild.name : 'any server'},
								use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
								For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
							`}
							To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.
		
							Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
							Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.
		
							__**${showAll ? 'All commands' : `Available commands in ${msg.guild || 'this DM'}`}**__
		
							${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
								.map(grp => stripIndents`
									__${grp.name}__
									${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
										.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
									}
								`).join('\n\n')
							}
						`)
					}));

				if(msg.channel.type !== 'dm') messages.push(await msg.replyEmbed(
					new MessageEmbed()
						.setColor('GREEN')
						.setDescription("Emergency help pack was sent to DMs!")
				));
			} catch(err) {
				messages.push(await msg.replyEmbed(
					new MessageEmbed()
						.setColor('RED')
						.setDescription('Door to your DMs was closed. You probably have DMs disabled.')
				));
			}
			return messages;
		}
	}
};
