import loadSlashInteractions from '../loaders/loadSlashInteractions';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import ICommand from '../utils/command';
import ClientWithCommands from '../utils/clientWithCommands';
import Discord, { messageLink } from 'discord.js';
import subcomandRunner from '../utils/subcommandRunner';

// TODO : jsDoc

export default {
    listener : async (bot:ClientWithCommands, interaction:Discord.Interaction) : Promise<void> => {
        if(interaction instanceof Discord.ChatInputCommandInteraction){
            let command:ICommand = await require(`../commands/${interaction.commandName}`).default;
            print(interaction.user.username + " --> " + interaction.commandName, LogLevel.Info, bot, interaction.guild);
            try{
                await interaction.deferReply();
                await subcomandRunner(bot, interaction, command);
                await command.run(bot, interaction);
            }catch(err){
                print(err, LogLevel.Error, bot, interaction.guild);
                interaction.reply("Sorry, an error has occurred. Please try again. If this persists, contact and administrator.");
            }
        }
    }
}