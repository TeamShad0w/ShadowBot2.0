//imports
import Discord from 'discord.js';
import internal from 'stream';
import Config from './config.json';
import loadCommands from './loaders/loadCommands';
import loadDatabase from './loaders/loadDatabase';
import loadEvents from './loaders/loadEvents';
import loadSlashInteractions from './loaders/loadSlashInteractions';

/**
 * The bot Client
 */
const bot = new Discord.Client({
    intents: [3276799]
});

/**
 * Tries to connect the bot Client to Discord servers
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */
async function login():Promise<number|string> {
    try {
        await bot.login(Config.token);
    }catch(err:unknown) {
        return "bot couldn't login : " + err;
    }
    return 1;
}

//TODO : jsDoc
interface tryFunctionCallbackType {
    (bot:Discord.Client) : Promise<number|string>;
}

//TODO : jsDoc
async function tryFunction(bot:Discord.Client, callback:tryFunctionCallbackType):Promise<void> {
    let tryF:number|string = await callback(bot);
    if( tryF !== 1){
        throw new Error(tryF.toString());
    }
}

//TODO : jsDoc
async function main():Promise<void> {
    console.log("starting bot");

    tryFunction(bot, login);

    console.log("bot logged in");

    console.log("connecting to database");

    tryFunction(bot, loadDatabase);

    console.log("connected to database");

    console.log("loading events");

    tryFunction(bot, loadEvents);

    console.log("events loaded");

    console.log("loading commands");

    tryFunction(bot, loadCommands);

    console.log("commands loaded");

    console.log("loading slash intercations");

    tryFunction(bot, loadSlashInteractions);

    console.log("slash interactions loaded");

    
}

main();

//TODO: create a console handler :  print(msg:string, loglevel) -->  in console : [DD/MM/YYYY at HH:MM:SS] msg