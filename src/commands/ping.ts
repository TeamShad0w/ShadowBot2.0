import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

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
}