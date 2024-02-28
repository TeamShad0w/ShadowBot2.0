import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

// TODO : jsDoc
export default {
    name : "ping",
    description : "replies with pong",
    permission : null,
    dm : true,

    //TODO : find type of interaction and replace any with it
    async run(bot:ClientWithCommands, interaction:any): Promise<void> {
        await interaction.reply("pong");
    }
}