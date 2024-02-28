import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

export default {
    name : "setup",
    description : "changes settings for how the bot should behave on your discord server",
    permission : Discord.PermissionFlagsBits.ManageGuild,
    dm : true,

    //TODO : find type of interaction and replace any with it
    async run(bot:ClientWithCommands, interaction:any): Promise<void> {
        await interaction.reply("pong");
    }
}