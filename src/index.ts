//imports
import Discord from 'discord.js';
import Config from './config.json';
import Default from './0.json';
import loadCommands from './loaders/loadCommands';
import loadDatabase from './loaders/loadDatabase';
import loadEvents from './loaders/loadEvents';
import loadSlashInteractions from './loaders/loadSlashInteractions';
import ClientWithCommands from './utils/clientWithCommands';
import print from './utils/consoleHandler';
import { LogLevel } from './utils/consoleHandler';
import { ITryFunctionCallback, tryFunction } from './utils/tryFunction';
import { IGlobalGuildContainer } from './utils/guildHandler';
import ConfigHandler from './utils/configHandler';

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
    let bot = new ClientWithCommands(Config, Default, { intents: [3276799] });

    print("starting bot...", LogLevel.Log, bot, null, true);

    await tryFunction(bot, login);

    print("bot logged in.", LogLevel.Info, bot, null, true);

    print("connecting to database...", LogLevel.Log, bot, null, true);

    await tryFunction(bot, loadDatabase);

    print("bot connected to database.", LogLevel.Info, bot, null, true);

    print("loading events...", LogLevel.Log, bot, null, true);

    await tryFunction(bot, loadEvents);

    print("events loaded.", LogLevel.Info, bot, null, true);

    bot.commands = new Discord.Collection()

    print("loading commands...", LogLevel.Log, bot, null, true);

    await tryFunction(bot, loadCommands);

    print("commands loaded.", LogLevel.Info, bot, null, true);
}

main();
