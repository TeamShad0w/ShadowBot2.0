import Discord from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import fs from "fs";
import path from "path"
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import { isAsyncFunction } from 'util/types';
import Ievent from '../utils/event';

/**
 * search each js file in events and 
 * verifie if the file loaded successfully
 * @param {ClientWithCommands} bot the client used by the bot
 * 
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */
export default async (bot:ClientWithCommands) : Promise<number|string> => {

    let err:string = "";

    let Way:string = path.dirname(path.dirname(__filename));
    fs.readdirSync(`${Way}/events`).filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async file => {

        let event:Ievent = await require(`${Way}/events/${file}`).default;

        if(!isAsyncFunction(event.listener)) {
            err += `${Way}/events/${file} is not a proper event module\r\n`;
            return false;
        }
        bot.on(file.slice(0,-3), (...args:any[]) => event.listener(bot, ...args));
        print(`EVENTLOAD : ${file} loaded.`, LogLevel.Info, bot, null, true);
    });

    if (err === "") { return 1; }
    return err;
}