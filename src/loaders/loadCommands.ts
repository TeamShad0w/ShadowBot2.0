import Discord from 'discord.js';
import fs from "fs";
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand from 'src/utils/command';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';


/**
 * ////TODO : add description
 */
export default async (bot:ClientWithCommands):Promise<number|string> => {
    
    // TODO : test the load command error message by putting a blank js files inside of src/commands dir

    //! DEBUG
    let err:string = ""

    fs.readdirSync("./commands").filter(f => f.endsWith(".js")).forEach(async file => {

        let command:ICommand = require(`./commands/${file}`);

        if(!command.name || typeof command.name !== "string") {
            err = `Incorect name for command ${file.slice(0, file.length -3)}.`;
            return false;
        }

        bot.commands.set(command.name, command);
        print(`commandload : ${file} loaded.`, LogLevel.Log);
    });

    if (err !== "") {
        return err;
    } else {
        return 1;
    }
}