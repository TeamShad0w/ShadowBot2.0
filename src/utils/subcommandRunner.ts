import Discord, { SelectMenuOptionBuilder } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand, { IOptions } from '../utils/command';
import print from './consoleHandler';

async function findSubcommand(root:IOptions | ICommand, name:string, bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction) : Promise<void> {
    if(!root.options) { return; }
    root.options.forEach(async option => {
        if(option.type !== 'Subcommand') { return; }
        if(!option.run) { throw new Error(`Subcommand ${option.name} have no run function.\r\n`); }
        if(option.name !== name) { return; }
        await option.run(bot, interaction);
    });
}

export default async function subcomandRunner(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction, command:ICommand) : Promise<void> {
    if(!command.options || !interaction.options.getSubcommand()) { return; }
    if(command.options.every(option => option.type !== ('Subcommand' || 'SubcommandGroup'))) { return; }
    if(interaction.options.getSubcommandGroup() === null) { return await findSubcommand(command, interaction.options.getSubcommand(), bot, interaction)}
    command.options.forEach(async option => {
        if(option.type !== 'SubcommandGroup') { return; }
        if(!option.options || option.options.every(option => option.type !== 'Subcommand')) { throw new Error(`Subcommand group ${option.name} have no subcommands.\r\n`); }
        if(option.name !== interaction.options.getSubcommandGroup()) { return; }
        await findSubcommand(option, interaction.options.getSubcommand(), bot, interaction);
    })
}