"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const consoleHandler_1 = tslib_1.__importDefault(require("../utils/consoleHandler"));
const consoleHandler_2 = require("../utils/consoleHandler");
exports.default = async (bot) => {
    if (bot.user === null) {
        return "Error while loading SlashCommands : bot.user is null";
    }
    let commands = [];
    bot.commands.forEach((command) => {
        let slashCommand = new discord_js_1.default.SlashCommandBuilder()
            .setName(command.name)
            .setDescription(command.description)
            .setDMPermission(command.dm)
            .setDefaultMemberPermissions(command.permission);
        commands.push(slashCommand);
        (0, consoleHandler_1.default)("Slash interaction : " + command.name + " is loaded.", consoleHandler_2.LogLevel.Log);
    });
    const rest = new discord_js_1.default.REST({ version: '10' }).setToken(bot.token == null ? "" : bot.token);
    await rest.put(discord_js_1.default.Routes.applicationCommands(bot.user.id), { body: commands });
    return 1;
};
