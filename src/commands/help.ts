import Discord, { ChatInputCommandInteraction, Interaction, messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import path from "path";
import fs from "fs"
import print from '../utils/consoleHandler';

/**
 * search each js file in commands and 
 * add the name and fonction of the command in the list 
 * return the list as a reply of the msg
 * @param {ClientWithCommands} bot the client used by the bot
 * @param {ChatInputCommandInteraction} interaction the interaction from the user
 * 
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */
export default {
    name : "help",
    description : "replies with a list of commands",
    permission : null,
    dm : true,

    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {

        let Way:string = path.dirname(path.dirname(__filename));

        let fmsg:string = "";

        fmsg += "Here the list of the commands and a short description :";
        fs.readdir(`${Way}/commands`, async (err,files) => {
            files.filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async (file:string, index:number, array:Array<string>) => {
                let command = await require(`${Way}/commands/${file}`).default;
                fmsg += `\r\n> **${command.name}** : *${command.description}*`;

                if(index === array.length - 1) {
                    interaction.followUp(fmsg);
                }
            })
        });
    }
};
