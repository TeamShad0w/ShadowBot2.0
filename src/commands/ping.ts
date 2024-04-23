import Discord from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand from '../utils/command';

/**
 * simple fonction that respond pong when the user send /ping
 */
export default {
    name : "ping",
    description : "replies with pong",
    permission : null,
    dm : true,

    /**
     * executes the module's command. (see module description)
     * 
     * @param {ClientWithCommands} bot the client used by the bot
     * @param {ChatInputCommandInteraction} interaction the interaction from the user
     * 
     * @returns {Promise<void>}
     */
    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
        await interaction.followUp("pong");
    }
} as ICommand;