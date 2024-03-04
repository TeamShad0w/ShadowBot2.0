"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewGuildData = exports.GuildHandler = void 0;
const consoleHandler_1 = require("./consoleHandler");
class GuildHandler {
    id;
    database;
    logChannel;
    constructor(_id, _databse = { url: "-1", APIKey: "-1" }, _logChannel = { id: "-1", logLevel: consoleHandler_1.LogLevel.Info }) {
        this.id = _id;
        this.database = _databse;
        this.logChannel = _logChannel;
    }
}
exports.GuildHandler = GuildHandler;
async function createNewGuildData(bot, guild) {
    let guildData = new GuildHandler(guild.id);
    bot.guildHandlers.set(guild, {
        guildData: guildData,
        id: guild.id
    });
    bot.configHandler.modify((config) => {
        let configBuffer = config;
        configBuffer.guilds.push(guildData);
        return configBuffer;
    });
}
exports.createNewGuildData = createNewGuildData;
async function setHandlers(bot) {
    let guildsData = bot.configHandler.value.guilds;
    bot.guilds.cache.each(guild => {
        if (guildsData.length === 0) {
            createNewGuildData(bot, guild);
            return;
        }
        if (guildsData.every((guildData, index, guildsData) => {
            if (guildData.id !== guild.id) {
                return true;
            }
            bot.guildHandlers.set(guild, {
                guildData: new GuildHandler(guild.id, guildData.database, guildData.logChannel),
                id: guild.id
            });
            return false;
        })) {
            createNewGuildData(bot, guild);
        }
    });
    return 1;
}
exports.default = setHandlers;
