import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

/**
 * simple fonction that respond pong when the user send /ping
 * @param {ClientWithCommands} bot the client used by the bot
 * @param {ChatInputCommandInteraction} interaction the interaction from the user
 * 
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */

export default {
    name : "ping",
    description : "replies with pong",
    permission : null,
    dm : true,

    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
        await interaction.followUp("pong");
    }
}