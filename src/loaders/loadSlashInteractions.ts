import Discord from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';

//TODO : jsDoc
export default async (bot:ClientWithCommands) : Promise<number|string> => {
    
    //TODO : finish SlashInteraction

    if(bot.user === null) { return "Error while loading SlashCommands : bot.user is null"; }

    let commands:Array<Discord.SlashCommandBuilder> = [];

    bot.commands.forEach((command:any) => {
        let slashCommand:Discord.SlashCommandBuilder = new Discord.SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description)
            .setDMPermission(command.dm)
            .setDefaultMemberPermissions(command.permission);

        commands.push(slashCommand);

        print("Slash interaction : " + command.name + " is loaded.", LogLevel.Log);
    })

    const rest = new Discord.REST({version: '10'}).setToken(bot.token == null ? "" : bot.token);

    await rest.put(Discord.Routes.applicationCommands(bot.user.id), {body: commands});

    return 1;
}