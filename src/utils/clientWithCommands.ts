import Discord from 'discord.js';
import ICommand from './command';
import { IGlobalGuildContainer } from './guildHandler';
import Iconfig from './configHandler';

export default interface ClientWithCommands extends Discord.Client {
    commands: Discord.Collection<string, ICommand>;
    guildHandlers : Discord.Collection<Discord.Guild, IGlobalGuildContainer>;
    config : Iconfig;
}