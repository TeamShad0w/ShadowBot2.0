import Discord from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import fs from "fs";
import path from "path"
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import { isAsyncFunction } from 'util/types';

/**
 * search each js file in events and 
 * //// TODO : finish the jsdoc
 * @param {ClientWithCommands} bot the client used by the bot
 * 
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */
export default async (bot:ClientWithCommands) : Promise<number|string> => {

    let err:string = "";

    let Way:string = path.dirname(path.dirname(__filename));
    fs.readdirSync(`${Way}/events`).filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async file => {

        let event = await require(`${Way}/events/${file}`);

        if(!isAsyncFunction(event.listener)) {
            err += `${Way}/events/${file} is not a proper event module\r\n`;
        }

        // TODO : need verification 
        bot.on(file.slice(0,-3), event.listener);

        print(`EVENTLOAD : ${file} loaded.`, LogLevel.Info);
    });

    if (err === "") { return 1; }
    return err;
}