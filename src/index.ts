//imports
import Discord from 'discord.js';
import Config from './config.json';
import loadCommands from './loaders/loadCommands';
import loadDatabase from './loaders/loadDatabase';
import loadEvents from './loaders/loadEvents';
import loadSlashInteractions from './loaders/loadSlashInteractions';
import ClientWithCommands from './utils/clientWithCommands';

/**
 * Tries to connect the bot Client to Discord servers
 * @param {ClientWithCommands} the client used by the bot
 * 
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */
async function login(bot:ClientWithCommands):Promise<number|string> {
    try {
        await bot.login(Config.token);
    }catch(err:unknown) {
        return "bot couldn't login : " + err;
    }
    return 1;
}

//TODO : jsDoc
interface ITryFunctionCallback {
  (bot:ClientWithCommands) : Promise<number|string>;
}

//TODO : jsDoc
async function tryFunction(bot:ClientWithCommands, callback:ITryFunctionCallback):Promise<void> {
    let tryF:number|string = await callback(bot);
    if( tryF !== 1){
        throw new Error(tryF.toString());
    }
}

//TODO : jsDoc
async function main():Promise<void> {

    /**
     * The bot Client
     */
    const bot = new Discord.Client({
        intents: [3276799]
    }) as ClientWithCommands;

    console.log("starting bot");

    await tryFunction(bot, login);

    console.log("bot logged in");

    console.log("connecting to database");

    await tryFunction(bot, loadDatabase);

    console.log("connected to database");

    console.log("loading events");

    await tryFunction(bot, loadEvents);

    console.log("events loaded");

    bot.commands = new Discord.Collection()

    console.log("loading commands");

    await tryFunction(bot, loadCommands);

    console.log("commands loaded");

    console.log("loading slash intercations");

    await tryFunction(bot, loadSlashInteractions);

    console.log("slash interactions loaded");
}

main();