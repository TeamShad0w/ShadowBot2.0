"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const consoleHandler_1 = tslib_1.__importDefault(require("../utils/consoleHandler"));
const consoleHandler_2 = require("../utils/consoleHandler");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const subcommandRunner_1 = tslib_1.__importDefault(require("../utils/subcommandRunner"));
exports.default = {
    listener: async (bot, interaction) => {
        if (interaction instanceof discord_js_1.default.ChatInputCommandInteraction) {
            let command = await require(`../commands/${interaction.commandName}`).default;
            (0, consoleHandler_1.default)(interaction.user.username + " --> " + interaction.commandName, consoleHandler_2.LogLevel.Info, bot, interaction.guild);
            try {
                await interaction.deferReply();
                await (0, subcommandRunner_1.default)(bot, interaction, command);
                await command.run(bot, interaction);
            }
            catch (err) {
                (0, consoleHandler_1.default)(err, consoleHandler_2.LogLevel.Error, bot, interaction.guild);
                interaction.reply("Sorry, an error has occurred. Please try again. If this persists, contact and administrator.");
            }
        }
    }
};
