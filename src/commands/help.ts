import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

//! This command is as it should be, do not modify it, modify external functinos if needed.

export default {
    name : "help",
    description : "replies with a list of commands",
    permission : null,
    dm : true,

    //TODO : find type of interaction and replace any with it
    async run(bot:ClientWithCommands, interaction:any): Promise<void> {
        await interaction.reply("Here the list of the commands and a short description : \n /ping : and the bot will reply pong \n /setup : same as Ping actually ");
    }
}