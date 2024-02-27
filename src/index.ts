//imports
import Discord from 'discord.js';
import Config from './config.json';
import loadCommands from './loaders/loadCommands';
import loadDatabase from './loaders/loadDatabase';
import loadEvents from './loaders/loadEvents';
import loadSlashInteractions from './loaders/loadSlashInteractions';
import ClientWithCommands from './utils/clientWithCommands';
import print from './utils/consoleHandler';
import { LogLevel } from './utils/consoleHandler';
import { ITryFunctionCallback, tryFunction } from './utils/tryFunction';

/**
 * Tries to connect the bot Client to Discord servers
 * @param {ClientWithCommands} bot the client used by the bot
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
async function main():Promise<void> {

    /**
     * The bot Client
     */
    const bot = new Discord.Client({
        intents: [3276799]
    }) as ClientWithCommands;

    print("starting bot...", LogLevel.Log);

    await tryFunction(bot, login);

    print("bot logged in.", LogLevel.Info);

    print("connecting to database...", LogLevel.Log);

    await tryFunction(bot, loadDatabase);

    print("bot connected to database.", LogLevel.Info);

    print("loading events...", LogLevel.Log);

    await tryFunction(bot, loadEvents);

    print("events loaded.", LogLevel.Info);

    bot.commands = new Discord.Collection()

    print("loading commands...", LogLevel.Log);

    await tryFunction(bot, loadCommands);

    print("commands loaded.", LogLevel.Info);
}

main();
