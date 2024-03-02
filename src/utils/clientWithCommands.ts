import Discord from 'discord.js';
import ICommand from './command';
import { IGlobalGuildContainer } from './guildHandler';
import ConfigHandler from './configHandler';
import { Iconfig } from './configHandler';

// TODO : jsDoc
export default class ClientWithCommands extends Discord.Client {
    public commands: Discord.Collection<string, ICommand>;
    public guildHandlers : Discord.Collection<Discord.Guild, IGlobalGuildContainer>;
    public configHandler : ConfigHandler;
    constructor(Config:Iconfig, options:any){
        super(options);
        this.commands = new Discord.Collection<string, ICommand>();
        this.guildHandlers = new Discord.Collection<Discord.Guild, IGlobalGuildContainer>();
        this.configHandler = new ConfigHandler(Config);
    }
}