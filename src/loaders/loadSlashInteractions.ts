import Discord, { BurstHandlerMajorIdKey } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import ICommand from '../utils/command';
import { CommandOptionType } from '../utils/command'

//TODO : create slash command options types interfaces


//TODO : jsDoc
export default async (bot:ClientWithCommands) : Promise<number|string> => {

    let err:string = "";

    if(bot.user === null) { return "Error while loading SlashCommands : bot.user is null"; }

    let commands:Array<Discord.SlashCommandBuilder> = [];

    bot.commands.forEach((command:ICommand) => {
        let slashCommand:Discord.SlashCommandBuilder = new Discord.SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description)
            .setDMPermission(command.dm)
            .setDefaultMemberPermissions(command.permission);

        if(command.options && command.options.length >= 1){
            for(let i = 0; i < command.options.length; i++){
                if(command.options[i] !== undefined){
                    //TODO : finish this
                    /*
                    switch (command.options[i].type) {
                        case CommandOptionType.String:
                            slashCommand[`add${command.options[i].type.toString()}Option` as "addStringOption"]((option:Discord.SlashCommandStringOption) => {
                                
                                return option.setName(command.options[i].name)
                                .setDescription("e")
                                .setRequired(false)
                                .addChoices()
                            });
                            break;
                        default :
                            err += `Unknown option type for ${command.name}/${command.options[i].name} : ${command.options[i].type}\r\n`;
                    }*/
                }else{
                    err += `Error while looping through ${command.name}'s options : option don't exist at index ${i}.`;
                }
            }
        }

        commands.push(slashCommand);

        print("Slash interaction : " + command.name + " is loaded.", LogLevel.Log);
    });

    const rest = new Discord.REST({version: '10'}).setToken(bot.token == null ? "" : bot.token);

    await rest.put(Discord.Routes.applicationCommands(bot.user.id), {body: commands});


    if (err === "") { return 1; }
    return err;
}