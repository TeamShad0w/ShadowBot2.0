"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplePrint = exports.releaseLogsFromPipe = exports.logOnGuild = exports.sendEmbeddedLog = exports.LogLevel = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Debug"] = 0] = "Debug";
    LogLevel[LogLevel["Log"] = 1] = "Log";
    LogLevel[LogLevel["Info"] = 2] = "Info";
    LogLevel[LogLevel["Warn"] = 3] = "Warn";
    LogLevel[LogLevel["Error"] = 4] = "Error";
    LogLevel[LogLevel["Critical"] = 5] = "Critical";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
async function sendEmbeddedLog(logChannel, bot, msg, logLevel, dateTime, guild) {
    const embeddedLog = new discord_js_1.default.EmbedBuilder()
        .setTitle(LogLevel[logLevel])
        .setDescription(msg)
        .setTimestamp(dateTime);
    if (guild === null) {
        embeddedLog.setFooter({
            text: "log sent to every server",
            iconURL: bot.user?.avatarURL() ?? undefined
        });
    }
    switch (logLevel) {
        case LogLevel.Debug:
            embeddedLog.setColor(0xFFFFFF);
            break;
        case LogLevel.Log:
            embeddedLog.setColor(0x000000);
            break;
        case LogLevel.Info:
            embeddedLog.setColor(0x006bff);
            break;
        case LogLevel.Warn:
            embeddedLog.setColor(0xffa400);
            break;
        case LogLevel.Error:
            embeddedLog.setColor(0xd50d0d);
            break;
        case LogLevel.Critical:
            embeddedLog.setColor(0xd50d0d);
            break;
    }
    await logChannel.send({
        content: "",
        embeds: [embeddedLog]
    });
}
exports.sendEmbeddedLog = sendEmbeddedLog;
async function logOnGuild(bot, guild, logLevel, dateTime, msg) {
    await Promise.all(bot.guilds.cache.map(async (_guild) => {
        if (guild !== null && guild.id !== _guild.id) {
            return _guild;
        }
        await Promise.all((await bot.configHandler.getGuildData(_guild)).map(async (guildData) => {
            if (!guildData.logChannel) {
                return guildData;
            }
            if (logLevel < guildData.logChannel.logLevel || guildData.logChannel.id === "-1") {
                return guildData;
            }
            if (!_guild.channels.cache.get(guildData.logChannel.id)) {
                return guildData;
            }
            const logChannel = await _guild.channels.fetch(guildData.logChannel.id);
            if (logChannel === null || !logChannel.isTextBased()) {
                return guildData;
            }
            await sendEmbeddedLog(logChannel, bot, msg, logLevel, dateTime, guild);
            return guildData;
        }));
        return _guild;
    }));
}
exports.logOnGuild = logOnGuild;
async function releaseLogsFromPipe(bot) {
    bot.logPipe.forEach(async (log) => {
        await logOnGuild(bot, log[3], log[1], log[2], log[0]);
    });
}
exports.releaseLogsFromPipe = releaseLogsFromPipe;
async function print(msg, logLevel = LogLevel.Debug, bot, guild, hold = false, _dateTime = true) {
    let dateTime = new Date();
    let dateTimeIndicator = _dateTime ? "[" + dateTime.toLocaleString().replace(", ", " at ") + "]" : "";
    let formattedMsg = `${dateTimeIndicator} : ${LogLevel[logLevel].toUpperCase() === "CRITICAL" ? "CRITICAL ERROR" : LogLevel[logLevel].toUpperCase()} ==> ${msg}`;
    let logLevelString = LogLevel[logLevel].toLowerCase();
    console[`${logLevelString === "critical" ? "error" : logLevelString}`](formattedMsg);
    if (!hold) {
        return await logOnGuild(bot, guild, logLevel, dateTime, msg.toString());
    }
    bot.logPipe.push([msg.toString(), logLevel, dateTime, guild]);
}
exports.default = print;
async function simplePrint(msg, logLevel = LogLevel.Debug) {
    let dateTime = new Date();
    let dateTimeIndicator = "[" + dateTime.toLocaleString().replace(", ", " at ") + "]";
    let formattedMsg = `${dateTimeIndicator} : ${LogLevel[logLevel].toUpperCase() === "CRITICAL" ? "CRITICAL ERROR" : LogLevel[logLevel].toUpperCase()} ==> ${msg}`;
    let logLevelString = LogLevel[logLevel].toLowerCase();
    console[`${logLevelString === "critical" ? "error" : logLevelString}`](formattedMsg);
}
exports.simplePrint = simplePrint;
