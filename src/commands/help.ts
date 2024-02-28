import Discord, { messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import path from "path";
import fs from "fs"
import print from '../utils/consoleHandler';

// TODO : jsDoc
export default {
    name : "help",
    description : "replies with a list of commands",
    permission : null,
    dm : true,

    //TODO : find type of interaction and replace any with it
    async run(bot:ClientWithCommands, interaction:any): Promise<void> {

        let Way:string = path.dirname(path.dirname(__filename));

        let fmsg:string = "";

        fmsg += "Here the list of the commands and a short description :";
        fs.readdir(`${Way}/commands`, async (err,files) => {
            files.filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async (file:string, index:number, array:Array<string>) => {
                let command = await require(`${Way}/commands/${file}`).default;
                fmsg += `\r\n> **${command.name}** : *${command.description}*`;

                if(index === array.length - 1) {
                    interaction.reply(fmsg);
                }
            })
        });
    }
};
