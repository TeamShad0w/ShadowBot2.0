import Discord from 'discord.js';
import ICommand from './command';
import { IGlobalGuildContainer } from './guildHandler';
import ConfigHandler from './configHandler';
import { Iconfig } from './configHandler';
import { LogLevel } from './consoleHandler';

// TODO : jsDoc
export default class ClientWithCommands extends Discord.Client {
    public commands: Discord.Collection<string, ICommand>;
    public guildHandlers : Discord.Collection<Discord.Guild, IGlobalGuildContainer>;
    public configHandler : ConfigHandler;
    public logPipe : Array<[string, LogLevel, Date, Discord.Guild | null]> = [];
    constructor(_config:Iconfig, _default:Iconfig, options:any){
        super(options);
        this.commands = new Discord.Collection<string, ICommand>();
        this.guildHandlers = new Discord.Collection<Discord.Guild, IGlobalGuildContainer>();
        this.configHandler = new ConfigHandler(_config, _default);
    }
}