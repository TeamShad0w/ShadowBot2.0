import Discord from 'discord.js';
import fs from "fs";
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand from '../utils/command';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import path from "path";

/**
 * search each js file in commands and 
 * add the name and fonction of the command in the command collection
 * @param {ClientWithCommands} bot the client used by the bot
 * 
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */
export default async (bot:ClientWithCommands):Promise<number|string> => {

    let err:string = "";
    let Way:string = path.dirname(path.dirname(__filename));

    fs.readdirSync(`${Way}/commands`).filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async file => {

        let command:ICommand = require(`${Way}/commands/${file}`).default;

        if(!command.name || typeof command.name !== "string") {
            err += `Incorect name for command ${file.slice(0, -3)}.\r\n`;
            return false;
        }

        bot.commands.set(command.name, command);
        print(`commandload : ${file} loaded.`, LogLevel.Log, bot, null, true);
    });

    if (err === "") { return 1; }
    return err;
}