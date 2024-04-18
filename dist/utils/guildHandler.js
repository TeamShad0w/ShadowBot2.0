"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNewGuildData = exports.guildDataScanner = exports.GuildHandler = exports.isValidProperty = exports.isNode = void 0;
const consoleHandler_1 = require("./consoleHandler");
const objectNesting_1 = require("./objectNesting");
function isNode(node) {
    return node === "root" || node === "logChannel" || node === "logChannel.id" || node === "logChannel.logLevel";
}
exports.isNode = isNode;
async function isValidProperty(bot, node, value) {
    if (!isNode(node)) {
        return false;
    }
    if (node === "logChannel.logLevel") {
        return value.toString() in Object.keys(consoleHandler_1.LogLevel).filter(k => !Number.isNaN(Number.parseInt(k)));
    }
    let Tdefault = typeof await (0, objectNesting_1.getNestedProperty)((await bot.configHandler.getDefault()).guilds[0], node);
    return typeof value === typeof Tdefault;
}
exports.isValidProperty = isValidProperty;
class GuildHandler {
    id;
    logChannel;
    constructor(bot, _id, _logChannel = undefined) {
        this.id = _id;
        if (!_logChannel) {
            this.logChannel = { id: "-1", logLevel: 2 };
            bot.configHandler.getDefault().then(defaultConfig => {
                (0, objectNesting_1.getNestedProperty)(defaultConfig, "guilds.0.logChannel").then(defaultValue => {
                    this.logChannel = defaultValue;
                    bot.guilds.fetch(this.id).then(guild => {
                        this.modifyGuildSetup(bot, guild, guildData => {
                            guildData.logChannel = this.logChannel;
                            return guildData;
                        });
                    });
                });
            });
        }
        else {
            this.logChannel = _logChannel;
        }
    }
    modifyGuildSetup = async (bot, _guild, builder) => {
        if (!(await bot.configHandler.getValue()).guilds.some(guild => guild.id === _guild.id)) {
            await createNewGuildData(bot, _guild);
        }
        let index = (await bot.configHandler.getValue()).guilds.findIndex(guild => guild.id === _guild.id);
        (await bot.configHandler.getValue()).guilds[index] = await builder((await bot.configHandler.getValue()).guilds[index]);
        await bot.configHandler.write(bot, _guild);
    };
    resetGuildData = async (node, bot, _guild) => {
        let index = (await bot.configHandler.getValue()).guilds.findIndex(guild => guild.id === _guild.id);
        let oldData = (await bot.configHandler.getValue()).guilds[index];
        if (node === "root") {
            await bot.configHandler.modify(bot, _guild, (config) => {
                config.guilds.splice(index, 1);
                return config;
            });
            await createNewGuildData(bot, _guild);
        }
        else {
            await bot.configHandler.modify(bot, _guild, async (config) => {
                config.guilds[index] = await (0, objectNesting_1.setNestedProperty)(config.guilds[index], node, (0, objectNesting_1.getNestedProperty)(bot.configHandler.getValue(), "guilds.0." + node));
                return config;
            });
        }
        return oldData;
    };
}
exports.GuildHandler = GuildHandler;
async function guildDataScanner(bot, data, path = "root") {
    let toReturn = [];
    if (data === undefined || data === null) {
        let finalPath = path.replace("root.0.", "");
        toReturn.push(await isValidProperty(bot, finalPath, data) ? [finalPath, data, undefined] : [undefined, data, "The given data is not a property of the server config file."]);
        return toReturn;
    }
    const keys = Object.keys(data);
    if (keys.length === 0 || typeof data === "string") {
        let finalPath = path.replace("root.0.", "");
        toReturn.push(await isValidProperty(bot, finalPath, data) ? [finalPath, data, undefined] : [undefined, data, "The given data is not a property of the server config file."]);
        return toReturn;
    }
    toReturn = (await Promise.all(keys.flatMap(async (key) => {
        return await guildDataScanner(bot, data[key], path + "." + key);
    }))).flat();
    return toReturn;
}
exports.guildDataScanner = guildDataScanner;
async function createNewGuildData(bot, guild) {
    let guildData = new GuildHandler(bot, guild.id);
    bot.guildHandlers.set(guild, {
        guildData: guildData,
        id: guild.id
    });
    bot.configHandler.modify(bot, guild, (config) => {
        let configBuffer = config;
        configBuffer.guilds.push(guildData);
        return configBuffer;
    });
}
exports.createNewGuildData = createNewGuildData;
async function setHandlers(bot) {
    let guildsData = (await bot.configHandler.getValue()).guilds;
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
                guildData: new GuildHandler(bot, guild.id, guildData.logChannel),
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
