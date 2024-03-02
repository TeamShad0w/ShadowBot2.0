import Discord, { BurstHandlerMajorIdKey, SlashCommandBuilder } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import ICommand from '../utils/command';
import { IOptions } from '../utils/command'

//TODO : create slash command options types interfaces


function simpleCommandSetup(slashCommand:any, _option:IOptions) : void {
    
    slashCommand[`add${_option.type}Option`]((option:any) => {
        option.setName(_option.name)
        .setDescription(_option.description)
        .setRequired(_option.required);

        if(_option.choices){
            _option.choices.forEach(choice => option.addChoices(choice));
        }
        return option;
    });
}

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
                    let _option:IOptions = command.options[i]
                    switch(_option.type){
                        case "String" :
                        case "Number" :
                        case "Integer" :

                            simpleCommandSetup(slashCommand, _option);
                        break;
                        case "Boolean" :
                        case "User" :
                        case "Channel" :
                        case "Role" :
                        case "Mentionable" :
                        case "Attachment" :
                            simpleCommandSetup(slashCommand, _option);
                        break;
                        case "Subcommand" :
                            //TODO : handle subcommands
                        break;
                        default:
                            err += `Unknown option type ${command.options[i].type} in ${command.name}.`
                        break;

                    }

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