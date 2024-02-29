import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

export default {
    name : "setup",
    description : "changes settings for how the bot should behave on your discord server",
    permission : Discord.PermissionFlagsBits.ManageGuild,
    dm : true,

    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
        await interaction.reply("pong");
    }
}