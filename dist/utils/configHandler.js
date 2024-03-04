"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const guildHandler_1 = require("./guildHandler");
const consoleHandler_1 = tslib_1.__importDefault(require("./consoleHandler"));
const consoleHandler_2 = require("./consoleHandler");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
class ConfigHandler {
    value;
    constructor(_config) {
        this.value = _config;
    }
    ;
    modify = async (modifingFunction) => {
        this.value = await modifingFunction(this.value);
        this.write();
    };
    modifyGuildSetup = async (bot, _guild, builder) => {
        if (!this.value.guilds.some(guild => guild.id === _guild.id)) {
            await (0, guildHandler_1.createNewGuildData)(bot, _guild);
        }
        let index = this.value.guilds.findIndex(guild => guild.id === _guild.id);
        this.value.guilds[index] = await builder(this.value.guilds[index]);
        await this.write();
    };
    resetGuildData = async (bot, _guild) => {
        let index = this.value.guilds.findIndex(guild => guild.id === _guild.id);
        let oldData = this.value.guilds.splice(index, 1)[0];
        await (0, guildHandler_1.createNewGuildData)(bot, _guild);
        return oldData;
    };
    getGuildData = async (_guild) => {
        return this.value.guilds.filter(guild => guild.id === _guild.id);
    };
    write = async () => {
        try {
            let Way = path_1.default.dirname(path_1.default.dirname(__filename));
            fs_1.default.writeFileSync(`${Way}/config.json`, JSON.stringify(this.value, undefined, 4));
            (0, consoleHandler_1.default)("config.json modified", consoleHandler_2.LogLevel.Log);
        }
        catch (err) {
            return "Wasn't able to write config.json : " + err;
        }
        return 1;
    };
}
exports.default = ConfigHandler;
