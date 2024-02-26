import Discord from 'discord.js';

export default interface ClientWithCommands extends Discord.Client {
    commands: Discord.Collection<string, any>;
}