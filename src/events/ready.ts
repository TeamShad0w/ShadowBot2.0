import loadSlashInteractions from '../loaders/loadSlashInteractions';
import print, { releaseLogsFromPipe } from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import ClientWithCommands from '../utils/clientWithCommands';
import { ITryFunctionCallback, tryFunction } from '../utils/tryFunction';
import Discord from 'discord.js';
import setHandlers from '../utils/guildHandler';

// TODO : jsDoc

/**
 * simple fonction that print when ur bot is online 
 * @param {ClientWithCommands} bot the client used by the bot
 * 
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */

export default {
    listener : async (bot:ClientWithCommands) : Promise<void> =>  {
        if (bot.user === null) { return; }
        await tryFunction(bot, loadSlashInteractions);
        await tryFunction(bot, setHandlers);
        await releaseLogsFromPipe(bot);
        print(`${bot.user.username} online !`, LogLevel.Info, bot, null);
    }
}