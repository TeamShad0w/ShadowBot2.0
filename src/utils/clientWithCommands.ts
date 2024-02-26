import Discord from 'discord.js';
import ICommand from 'src/utils/command';

export default interface ClientWithCommands extends Discord.Client {
    commands: Discord.Collection<string, ICommand>;
}