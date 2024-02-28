import loadSlashInteractions from '../loaders/loadSlashInteractions';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import ClientWithCommands from '../utils/clientWithCommands';
import { ITryFunctionCallback, tryFunction } from '../utils/tryFunction';
import Discord from 'discord.js';
import setHandlers from '../utils/guildHandler';

export default {
    listener : async (bot:ClientWithCommands) : Promise<void> =>  {
        print("ready");
        if (bot.user === null) { return; }
        await tryFunction(bot, loadSlashInteractions);
        await tryFunction(bot, setHandlers);
        print(`${bot.user.username} online !`, LogLevel.Info);
    }
}