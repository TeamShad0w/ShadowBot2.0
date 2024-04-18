"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const consoleHandler_1 = tslib_1.__importDefault(require("../utils/consoleHandler"));
const consoleHandler_2 = require("../utils/consoleHandler");
const path_1 = tslib_1.__importDefault(require("path"));
exports.default = async (bot) => {
    let err = "";
    let Way = path_1.default.dirname(path_1.default.dirname(__filename));
    fs_1.default.readdirSync(`${Way}/commands`).filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async (file) => {
        let command = require(`${Way}/commands/${file}`).default;
        if (!command.name || typeof command.name !== "string") {
            err += `Incorect name for command ${file.slice(0, -3)}.\r\n`;
            return false;
        }
        bot.commands.set(command.name, command);
        (0, consoleHandler_1.default)(`commandload : ${file} loaded.`, consoleHandler_2.LogLevel.Log, bot, null, true);
    });
    if (err === "") {
        return 1;
    }
    return err;
};
