import Discord from 'discord.js';
import fs from "fs";
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand from 'src/utils/command';


/**
 * ////TODO : add description
 */
export default async (bot:ClientWithCommands):Promise<number|string> => {
    
    // TODO : test the load command error message by putting a blanck js files inside of src/commands dir

    let err:string = ""

    fs.readdirSync("./commands").filter(f => f.endsWith(".js")).forEach(async file => {

        let command:ICommand = require(`./commands/${file}`);

        if(!command.name || typeof command.name !== "string") {
            err = `Incorect name for command ${file.slice(0, file.length -3)}.`;
            return false;
        }

        bot.commands.set(command.name, command);
        console.log(`COMMANDLOAD : ${file} loaded.`);
    });

    if (err !== "") {
        return err;
    } else {
        return 1;
    }
}