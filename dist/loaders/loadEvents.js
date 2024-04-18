"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const consoleHandler_1 = tslib_1.__importDefault(require("../utils/consoleHandler"));
const consoleHandler_2 = require("../utils/consoleHandler");
const types_1 = require("util/types");
exports.default = async (bot) => {
    let err = "";
    let Way = path_1.default.dirname(path_1.default.dirname(__filename));
    fs_1.default.readdirSync(`${Way}/events`).filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async (file) => {
        let event = await require(`${Way}/events/${file}`).default;
        if (!(0, types_1.isAsyncFunction)(event.listener)) {
            err += `${Way}/events/${file} is not a proper event module\r\n`;
            return false;
        }
        bot.on(file.slice(0, -3), (...args) => event.listener(bot, ...args));
        (0, consoleHandler_1.default)(`EVENTLOAD : ${file} loaded.`, consoleHandler_2.LogLevel.Info, bot, null, true);
    });
    if (err === "") {
        return 1;
    }
    return err;
};
