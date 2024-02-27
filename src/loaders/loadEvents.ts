import Discord from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import fs from "fs";
import path from "path"

//TODO : jsDoc
export default async (bot:ClientWithCommands) : Promise<number|string> => {

    let err:string = "";

    let Way:string = path.dirname(path.dirname(__filename));
    fs.readdirSync(`${Way}/events`).filter(f => f.endsWith("js")).forEach(async file => {

        let event = require(`${Way}/events/${file}`)

        // TODO : need verification 

        if(!event.name || typeof event.name !== "string") {
            err = `Incorect name for event ${file.slice(0, file.length -3)}.`;
            return false;
        }
        bot.on(file.slice(0,-3), event.bind(null, bot))

        console.log(`EVENTLOAD : ${file} loaded.`)

    });

    if (err === "") { return 1; }
    return err;
}