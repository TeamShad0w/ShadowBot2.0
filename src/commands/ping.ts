import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

// TODO : jsDoc
export default {
    name : "ping",
    description : "replies with pong",
    permission : null,
    dm : true,

    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
        await interaction.reply("pong");
    }
}