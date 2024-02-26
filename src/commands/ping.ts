import Discord, { messageLink } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

export default {
    name : "ping",
    description : "replies with pong",
    permission : null, 
    dm : true,

    async run(bot:ClientWithCommands, msg:Discord.Message, interaction:Discord.Interaction): Promise<void> {
        await msg.reply("pong");
    }
}