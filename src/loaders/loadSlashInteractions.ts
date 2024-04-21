import Discord, { BurstHandlerMajorIdKey, Options, SlashCommandBuilder } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import print from '../utils/consoleHandler';
import { LogLevel } from '../utils/consoleHandler';
import ICommand from '../utils/command';
import { IOptions } from '../utils/command'

/**
 * Setups a simple (not subcommand nesting) option for a slashCommand
 * @param {any} slashCommand the command parent of the option
 * @param {IOptions} _option the option to setup as an object of interface IOptions
 * @returns {void}
 */
function simpleCommandSetup(slashCommand:any, _option:IOptions) : void {
    
    slashCommand[`add${_option.type}Option`]((option:any) => {
        option.setName(_option.name ?? "sorry, it seems that this option doesn't have a name")
        .setDescription(_option.description ?? "sorry, it seems that this option doesn't have a description.")
        .setRequired(_option.required ?? false);

        if(_option.choices){
            _option.choices.forEach(choice => option.addChoices(choice));
        }
        return option;
    });
}

/**
 * Setups a complete command containig subCommand nesting.
 * @param {ClientWithCommands} bot The bot's client
 * @param {string} err the error pile 
 * @param {[ICommand, "command"] | [IOptions, "option"]} _command The parent command or the subCommand/subCommandGroup option that contains other options
 * @param {Discord.SlashCommandBuilder | Discord.SlashCommandSubcommandBuilder | Discord.SlashCommandSubcommandGroupBuilder} constructor The contructor parent of the options to setup.
 * @returns {[string, Discord.SlashCommandBuilder | Discord.SlashCommandSubcommandBuilder | Discord.SlashCommandSubcommandGroupBuilder]} All the couples (error / processed object)
 */
function completeCommandSetup(bot:ClientWithCommands, err:string, _command:[ICommand, "command"] | [IOptions, "option"], constructor:Discord.SlashCommandBuilder | Discord.SlashCommandSubcommandBuilder | Discord.SlashCommandSubcommandGroupBuilder) : [string, Discord.SlashCommandBuilder | Discord.SlashCommandSubcommandBuilder | Discord.SlashCommandSubcommandGroupBuilder] {    
    constructor.setName(_command[0].name)
    .setDescription(_command[0].description);
    
    if(constructor instanceof Discord.SlashCommandBuilder && _command[1] === "command"){
        constructor.setDMPermission(_command[0].dm)
        .setDefaultMemberPermissions(_command[0].permission);
    }

    let command = _command[0];

    if(command.options && command.options.length >= 1){
        command.options.forEach((_option, index) => {
            if(_option !== undefined){
                switch(_option.type){
                    case "String" :
                    case "Number" :
                    case "Integer" :
                    case "Boolean" :
                    case "User" :
                    case "Channel" :
                    case "Role" :
                    case "Mentionable" :
                    case "Attachment" :
                        simpleCommandSetup(constructor, _option);
                    break;
                    case "Subcommand" :
                        if(constructor instanceof Discord.SlashCommandSubcommandBuilder){
                            err += `Error while loading subcommand ${constructor.name}, subcommands cannot have others subcommands as options.\r\n`;
                            break;
                        }
                        constructor.addSubcommand(builder => {
                            let bufferTuple = completeCommandSetup(bot, err, [_option, "option"], builder);
                            err += bufferTuple[0];
                            if(bufferTuple[1] instanceof Discord.SlashCommandSubcommandBuilder) { return bufferTuple[1]; }
                            err += `Error while loading ${command.name}'s subcommand (${_option.name}) : returned constructor is wrong type (${typeof bufferTuple[1]}).\r\n`;
                            return builder.setName("not_loaded")
                            .setDescription(`Error loading ${command.name}'s subcommand (${_option.name})`);
                        });
                    break;
                    case "SubcommandGroup" :
                        if(constructor instanceof Discord.SlashCommandSubcommandGroupBuilder){
                            err += `Error while loading subcommand group ${constructor.name}, subcommand groups cannot have others subcommand groups as options. Only a one level deep nesting is allowed by discord API.\r\n`;
                            break;
                        }
                        if(constructor instanceof Discord.SlashCommandSubcommandBuilder){
                            err += `Error while loading subcommand ${constructor.name}, subcommands cannot have subcommand groups as options.\r\n`;
                            break;
                        }
                        constructor.addSubcommandGroup(builder => {
                            let bufferTuple = completeCommandSetup(bot, err, [_option, "option"], builder);
                            err += bufferTuple[0];
                            if(bufferTuple[1] instanceof Discord.SlashCommandSubcommandGroupBuilder) { return bufferTuple[1]; }
                            err += `Error while loading ${command.name}'s subcommand (${_option.name}) : returned constructor is wrong type (${typeof bufferTuple[1]}).\r\n`;
                            return builder.setName("not_loaded")
                            .setDescription(`Error loading ${command.name}'s subcommand (${_option.name})`);
                        });
                    break;
                    default:
                        err += `Unknown option type ${_option.type} in ${command.name}.\r\n`;
                    break;
                }
            }else{
                err += `Error while looping through ${command.name}'s options : option don't exist at index ${index}.\r\n`;
            }
        });
    }

    if(constructor instanceof Discord.SlashCommandBuilder){ print("Slash interaction : " + command.name + " is loaded.", LogLevel.Log, bot, null, true); }

    return [err, constructor];
}

/**
 * Contains a function that setup the slash interactions, and tell to discord wich one the bot has.
 * 
 * @param {ClientWithCommands} bot The bot's client
 * @returns {Promise<number|string>} 1 if successful, the message to throw otherwise.
 */
export default async (bot:ClientWithCommands) : Promise<number|string> => {

    let err:string = "";

    if(bot.user === null) { return "Error while loading SlashCommands : bot.user is null\r\n"; }

    let commands:Array<Discord.SlashCommandBuilder> = [];

    bot.commands.forEach((command:ICommand) => {
        let bufferTuple = completeCommandSetup(bot, err, [command, "command"], new Discord.SlashCommandBuilder());
        err += bufferTuple[0];
        if(bufferTuple[1] instanceof Discord.SlashCommandBuilder) { return commands.push(bufferTuple[1]); }
        err += `Error while loading ${command.name} : returned constructor is wrong type (subcommand builder).\r\n`;
    });

    const rest = new Discord.REST({version: '10'}).setToken(bot.token == null ? "" : bot.token);
    const config = await bot.configHandler.getValue()

    if(config.devStage){
        await Promise.all(config.guilds.map(async guild => {
            if(bot.user === null) { return "Error while loading SlashCommands : bot.user is null\r\n"; }
            return await rest.put(Discord.Routes.applicationGuildCommands(bot.user.id, guild.id,), {body: commands});
        }));
    }else{
        await rest.put(Discord.Routes.applicationCommands(bot.user.id), {body: commands});
    }

    if (err === "") { return 1; }
    return err;
}