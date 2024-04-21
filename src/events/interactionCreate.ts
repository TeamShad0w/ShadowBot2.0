import loadSlashInteractions from '../loaders/loadSlashInteractions';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import ICommand from '../utils/command';
import ClientWithCommands from '../utils/clientWithCommands';
import Discord, { messageLink } from 'discord.js';
import subcomandRunner from '../utils/subcommandRunner';

/**
 * Contains the function executed when an interaction is created.
 */
export default {
    /**
     * 
     * @param {ClientWithCommands} bot The bot's client
     * @param {Discord.Interaction} interaction The created interaction that the bot will process
     * @returns {Promise<void>}
     */
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
                if(interaction.replied || interaction.deferred){
                    interaction.deleteReply()
                    interaction.followUp({content:"Sorry, an error has occurred. Please try again. If this persists, contact and administrator.", ephemeral:true});
                    return;
                }
                interaction.reply({content:"Sorry, an error has occurred. Please try again. If this persists, contact and administrator.", ephemeral:true});
            }
        }
    }
}