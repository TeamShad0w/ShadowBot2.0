import Discord from "discord.js";
import ClientWithCommands from "./clientWithCommands";

/*
 * The different types of displayed logs.
 */
export enum LogLevel {
    Debug,
    Log,
    Info,
    Warn,
    Error,
    Critical
}

// TODO : jsDoc
export async function sendEmbeddedLog(logChannel:Discord.TextBasedChannel, bot:ClientWithCommands, msg:string, logLevel:LogLevel, dateTime:Date, guild:Discord.Guild | null) : Promise<void> {
    
    const embeddedLog = new Discord.EmbedBuilder()
        .setTitle(LogLevel[logLevel])
        .setDescription(msg)
        .setTimestamp(dateTime)
    
    if(guild === null) {
        embeddedLog.setFooter({
            text : "log sent to every server",
            iconURL : bot.user?.avatarURL() ?? undefined
        })
    }
    
    switch (logLevel) {
        case LogLevel.Debug: embeddedLog.setColor(0xFFFFFF); break;
        case LogLevel.Log: embeddedLog.setColor(0x000000); break;
        case LogLevel.Info: embeddedLog.setColor(0x006bff); break;
        case LogLevel.Warn: embeddedLog.setColor(0xffa400); break;
        case LogLevel.Error: embeddedLog.setColor(0xd50d0d); break;
        case LogLevel.Critical: embeddedLog.setColor(0xd50d0d); break;
    }

    await logChannel.send({
        content : "",
        embeds : [embeddedLog]
    });
}

// TODO : jsDoc
export async function logOnGuild(bot:ClientWithCommands, guild:Discord.Guild | null, logLevel:LogLevel, dateTime:Date, msg:string) : Promise<void> {
    await Promise.all(bot.guilds.cache.map(async _guild => {
        if(guild !== null && guild.id !== _guild.id) { return _guild; }
        await Promise.all((await bot.configHandler.getGuildData(_guild)).map(async guildData => {
            if(!guildData.logChannel) { return guildData; }
            if(logLevel < guildData.logChannel.logLevel || guildData.logChannel.id === "-1") { return guildData; }
            if(!_guild.channels.cache.get(guildData.logChannel.id)) { return guildData; }
            const logChannel = await _guild.channels.fetch(guildData.logChannel.id)
            if(logChannel === null || !logChannel.isTextBased()) { return guildData; }
            await sendEmbeddedLog(logChannel, bot, msg, logLevel, dateTime, guild);
            return guildData;
        }));
        return _guild
    }));
}

// TODO : jsDoc
export async function releaseLogsFromPipe(bot:ClientWithCommands) : Promise<void> {
    bot.logPipe.forEach(async log => {
        await logOnGuild(bot, log[3], log[1], log[2], log[0]);
    });
}

// TODO : jsDoc
export default async function print(msg:any, logLevel:LogLevel=LogLevel.Debug, bot:ClientWithCommands, guild:Discord.Guild | null, hold=false, _dateTime:boolean=true) : Promise<void> {
    let dateTime = new Date();
    let dateTimeIndicator = _dateTime ? "[" + dateTime.toLocaleString().replace(", ", " at ") + "]" : "";
    let formattedMsg = `${dateTimeIndicator} : ${LogLevel[logLevel].toUpperCase() === "CRITICAL" ? "CRITICAL ERROR" : LogLevel[logLevel].toUpperCase()} ==> ${msg}`;
    let logLevelString = LogLevel[logLevel].toLowerCase() as "debug" | "log" | "info" | "warn" | "error" | "critical";
    console[`${logLevelString === "critical" ? "error" : logLevelString}`](formattedMsg);
    if(!hold) { return await logOnGuild(bot, guild, logLevel, dateTime, msg.toString()); }
    bot.logPipe.push([msg.toString(), logLevel, dateTime, guild]);
}

/**
 * Old version of the actual print function, display anything as proper log into console.
 * @param {any} msg The message to display.
 * @param {LogLevel} logLevel The type of the message (Default value : Debug).
 */
export async function simplePrint(msg:any, logLevel:LogLevel=LogLevel.Debug){
    let dateTime = new Date();
    let dateTimeIndicator = "[" + dateTime.toLocaleString().replace(", ", " at ") + "]";
    let formattedMsg = `${dateTimeIndicator} : ${LogLevel[logLevel].toUpperCase() === "CRITICAL" ? "CRITICAL ERROR" : LogLevel[logLevel].toUpperCase()} ==> ${msg}`;
    let logLevelString = LogLevel[logLevel].toLowerCase() as "debug" | "log" | "info" | "warn" | "error" | "critical";
    console[`${logLevelString === "critical" ? "error" : logLevelString}`](formattedMsg);
}