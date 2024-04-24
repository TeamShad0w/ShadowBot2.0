import Discord from 'discord.js';
import ICommand from './command';
import { GuildHandler } from './guildHandler';
import ConfigHandler from './configHandler';
import { Iconfig } from './configHandler';
import { LogLevel } from './consoleHandler';

/**
 * The bot's client class, holding his discord client, all the stored data, and classes that manages the config data, the guilds the bot is in, and the log system
 */
export default class ClientWithCommands extends Discord.Client {
    /** The differents commands handled by the bot */
    public commands: Discord.Collection<string, ICommand>;
    /** A collection binding a guild to a class holding its data */
    public guildHandlers : Discord.Collection<Discord.Guild, GuildHandler>;
    /** The class holding the stored data */
    public configHandler : ConfigHandler;
    /** Used to store logs at the start of the runtime to delivers it later on to the guilds when the bot is connected to discord */
    public logPipe : Array<[string, LogLevel, Date, Discord.Guild | null]> = [];
    /**
     * Initialize a ClientWithCommands class
     * @param {Iconfig} _config The data stored in config.json
     * @param {Iconfig} _default The data stored in 0.json
     * @param {Discord.ClientOptions} options The options for the discord client class
     */
    constructor(_config:Iconfig, _default:Iconfig, options:Discord.ClientOptions){
        super(options);
        this.commands = new Discord.Collection<string, ICommand>();
        this.guildHandlers = new Discord.Collection<Discord.Guild, GuildHandler>();
        this.configHandler = new ConfigHandler(_config, _default);
    }
}