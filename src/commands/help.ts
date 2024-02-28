import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import path from "path";
import fs from "fs"

//! This command is as it should be, do not modify it, modify external functinos if needed.

export default {
    name : "help",
    description : "replies with a list of commands",
    permission : null,
    dm : true,

    //TODO : find type of interaction and replace any with it
    async run(bot:ClientWithCommands, interaction:any): Promise<void> {

        let Way:string = path.dirname(path.dirname(__filename));

        let fmsg = "";

fmsg += "Here the list of the commands and a short description :";
fs.readdir(`${Way}/commands`,(err,files) => files.filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async file => {
    let command = await require(`${Way}/commands/${file}`).default;
    console.log(command)
    fmsg += `\r\n> **${command.name}** : *${command.description}*`;
    console.log(fmsg)

    }
    
)

// TODO: I NEED HELP IN HELP PLS

/*
interaction.reply(fmsg)
*/
)

}
};
