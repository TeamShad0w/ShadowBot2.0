import Discord from 'discord.js';

import fs from "fs";


import ClientWithCommands from '../utils/clientWithCommands';


//TODO : jsDoc
export default async (bot:ClientWithCommands):Promise<number|string> => {
    
    // TODO : loadCommands (see https://github.com/C0dex73/ShadowBot/blob/main/loader/loadCommands.js)
    let err = undefined

    fs.readdirSync("./commands").filter(f => f.endsWith(".js")).forEach(async file => {

        let command = require(`./commands/${file}`);

        if(!command.name || typeof command.name !== "string") {
            err = (`Incorect name for command ${file.slice(0, file.length -3)}.`)
            return false;
        } else {
            bot.commands.set(command.name, command)
            console.log(`COMMANDLOAD : ${file} loaded.`)
        }       
    })  
    if (err) {
        return err
    } else {
        return 1
    }
     ;
}