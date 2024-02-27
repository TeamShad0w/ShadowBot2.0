import Discord from 'discord.js';
import fs from "fs";
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand from 'src/utils/command';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import path from "path";

/**
 * ////TODO : add description
 */
export default async (bot:ClientWithCommands):Promise<number|string> => {

    let err:string = "";

    let Way:string = path.dirname(path.dirname(__filename));

    print(Way, LogLevel.Debug);

    fs.readdirSync(`${Way}/commands`).filter(f => f.endsWith(".js")).forEach(async file => {

        let command:ICommand = require(`${Way}/commands/${file}`);

        if(!command.name || typeof command.name !== "string") {
            err = `Incorect name for command ${file.slice(0, -3)}.`;
            return false;
        }

        bot.commands.set(command.name, command);
        print(`commandload : ${file} loaded.`, LogLevel.Log);
    });

    if (err === "") { return 1; }
    return err;
}