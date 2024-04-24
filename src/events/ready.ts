import loadSlashInteractions from '../loaders/loadSlashInteractions';
import print, { releaseLogsFromPipe } from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import ClientWithCommands from '../utils/clientWithCommands';
import { tryFunction } from '../utils/tryFunction';
import setHandlers from '../utils/guildHandler';

/**
 * Contains the function to execute when the bot is online
 */
export default {
    /**
     * simple fonction that print when ur bot is online 
     * @param {ClientWithCommands} bot the client used by the bot
     * 
     * @returns {Promise<void>}
     */
    listener : async (bot:ClientWithCommands) : Promise<void> =>  {
        if (bot.user === null) { return; }
        await tryFunction(bot, loadSlashInteractions);
        await tryFunction(bot, setHandlers);
        await releaseLogsFromPipe(bot);
        print(`${bot.user.username} online !`, LogLevel.Info, bot, null);
    }
}