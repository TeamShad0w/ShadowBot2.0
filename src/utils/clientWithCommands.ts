import Discord from 'discord.js';
import ICommand from './command';
import Iconfig from './configHandler';

export default interface ClientWithCommands extends Discord.Client {
    commands: Discord.Collection<string, ICommand>;
    config : Iconfig;
}