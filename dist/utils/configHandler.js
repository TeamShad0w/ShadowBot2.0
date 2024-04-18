"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const consoleHandler_1 = tslib_1.__importDefault(require("./consoleHandler"));
const consoleHandler_2 = require("./consoleHandler");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
class ConfigHandler {
    value;
    default;
    constructor(_config, _default) {
        this.value = _config;
        this.default = _default;
    }
    ;
    getValue = async () => {
        return this.value;
    };
    getDefault = async () => {
        return this.default;
    };
    modify = async (bot, guild, modifingFunction) => {
        this.value = await modifingFunction(this.value);
        this.write(bot, guild);
    };
    getGuildData = async (_guild) => {
        return this.value.guilds.filter(guild => guild.id === _guild.id);
    };
    write = async (bot, guild) => {
        try {
            let Way = path_1.default.dirname(path_1.default.dirname(__filename));
            fs_1.default.writeFileSync(`${Way}/config.json`, JSON.stringify(this.value, undefined, 4));
            (0, consoleHandler_1.default)("config.json modified", consoleHandler_2.LogLevel.Log, bot, guild);
        }
        catch (err) {
            return "Wasn't able to write config.json : " + err;
        }
        return 1;
    };
}
exports.default = ConfigHandler;
