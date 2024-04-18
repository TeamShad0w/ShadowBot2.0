"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const consoleHandler_1 = tslib_1.__importDefault(require("../utils/consoleHandler"));
const consoleHandler_2 = require("../utils/consoleHandler");
function simpleCommandSetup(slashCommand, _option) {
    slashCommand[`add${_option.type}Option`]((option) => {
        option.setName(_option.name ?? "sorry, it seems that this option doesn't have a name")
            .setDescription(_option.description ?? "sorry, it seems that this option doesn't have a description.")
            .setRequired(_option.required ?? false);
        if (_option.choices) {
            _option.choices.forEach(choice => option.addChoices(choice));
        }
        return option;
    });
}
function completeCommandSetup(bot, err, _command, constructor) {
    constructor.setName(_command[0].name)
        .setDescription(_command[0].description);
    if (constructor instanceof discord_js_1.default.SlashCommandBuilder && _command[1] === "command") {
        constructor.setDMPermission(_command[0].dm)
            .setDefaultMemberPermissions(_command[0].permission);
    }
    let command = _command[0];
    if (command.options && command.options.length >= 1) {
        command.options.forEach((_option, index) => {
            if (_option !== undefined) {
                switch (_option.type) {
                    case "String":
                    case "Number":
                    case "Integer":
                    case "Boolean":
                    case "User":
                    case "Channel":
                    case "Role":
                    case "Mentionable":
                    case "Attachment":
                        simpleCommandSetup(constructor, _option);
                        break;
                    case "Subcommand":
                        if (constructor instanceof discord_js_1.default.SlashCommandSubcommandBuilder) {
                            err += `Error while loading subcommand ${constructor.name}, subcommands cannot have others subcommands as options.\r\n`;
                            break;
                        }
                        constructor.addSubcommand(builder => {
                            let bufferTuple = completeCommandSetup(bot, err, [_option, "option"], builder);
                            err += bufferTuple[0];
                            if (bufferTuple[1] instanceof discord_js_1.default.SlashCommandSubcommandBuilder) {
                                return bufferTuple[1];
                            }
                            err += `Error while loading ${command.name}'s subcommand (${_option.name}) : returned constructor is wrong type (${typeof bufferTuple[1]}).\r\n`;
                            return builder.setName("not_loaded")
                                .setDescription(`Error loading ${command.name}'s subcommand (${_option.name})`);
                        });
                        break;
                    case "SubcommandGroup":
                        if (constructor instanceof discord_js_1.default.SlashCommandSubcommandGroupBuilder) {
                            err += `Error while loading subcommand group ${constructor.name}, subcommand groups cannot have others subcommand groups as options. Only a one level deep nesting is allowed by discord API.\r\n`;
                            break;
                        }
                        if (constructor instanceof discord_js_1.default.SlashCommandSubcommandBuilder) {
                            err += `Error while loading subcommand ${constructor.name}, subcommands cannot have subcommand groups as options.\r\n`;
                            break;
                        }
                        constructor.addSubcommandGroup(builder => {
                            let bufferTuple = completeCommandSetup(bot, err, [_option, "option"], builder);
                            err += bufferTuple[0];
                            if (bufferTuple[1] instanceof discord_js_1.default.SlashCommandSubcommandGroupBuilder) {
                                return bufferTuple[1];
                            }
                            err += `Error while loading ${command.name}'s subcommand (${_option.name}) : returned constructor is wrong type (${typeof bufferTuple[1]}).\r\n`;
                            return builder.setName("not_loaded")
                                .setDescription(`Error loading ${command.name}'s subcommand (${_option.name})`);
                        });
                        break;
                    default:
                        err += `Unknown option type ${_option.type} in ${command.name}.\r\n`;
                        break;
                }
            }
            else {
                err += `Error while looping through ${command.name}'s options : option don't exist at index ${index}.\r\n`;
            }
        });
    }
    if (constructor instanceof discord_js_1.default.SlashCommandBuilder) {
        (0, consoleHandler_1.default)("Slash interaction : " + command.name + " is loaded.", consoleHandler_2.LogLevel.Log, bot, null, true);
    }
    return [err, constructor];
}
exports.default = async (bot) => {
    let err = "";
    if (bot.user === null) {
        return "Error while loading SlashCommands : bot.user is null\r\n";
    }
    let commands = [];
    bot.commands.forEach((command) => {
        let bufferTuple = completeCommandSetup(bot, err, [command, "command"], new discord_js_1.default.SlashCommandBuilder());
        err += bufferTuple[0];
        if (bufferTuple[1] instanceof discord_js_1.default.SlashCommandBuilder) {
            return commands.push(bufferTuple[1]);
        }
        err += `Error while loading ${command.name} : returned constructor is wrong type (subcommand builder).\r\n`;
    });
    const rest = new discord_js_1.default.REST({ version: '10' }).setToken(bot.token == null ? "" : bot.token);
    await rest.put(discord_js_1.default.Routes.applicationCommands(bot.user.id), { body: commands });
    if (err === "") {
        return 1;
    }
    return err;
};
