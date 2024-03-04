import Discord from "discord.js";
import ClientWithCommands from "./clientWithCommands";

// TODO : jsDoc
export enum LogLevel {
    Debug,
    Log,
    Info,
    Warn,
    Error,
    Critical
}


export async function logOnGuild(bot:ClientWithCommands, guild:Discord.Guild | null, logLevel:LogLevel, msg:any) : Promise<void> {
    await Promise.all(bot.guilds.cache.map(async _guild => {
        if(guild !== null && guild.id !== _guild.id) { return _guild; }
        await Promise.all((await bot.configHandler.getGuildData(_guild)).map(async guildData => {
            if(logLevel < guildData.logChannel.logLevel) { return guildData; }
            const logChannel = await _guild.channels.fetch(guildData.logChannel.id)
            if(logChannel === null || !logChannel.isTextBased()) { return guildData; }
            await logChannel.send(msg);
            return guildData;
        }));
        return _guild
    }));
}

export async function releaseLogsFromPipe(bot:ClientWithCommands, guild:Discord.Guild | null) : Promise<void> {
    bot.logPipe.forEach(async log => {
        await logOnGuild(bot, guild, log[1], log[0]);
    });
}

// TODO : jsDoc
export default async function print(msg:any, logLevel:LogLevel=LogLevel.Debug, bot:ClientWithCommands, guild:Discord.Guild | null, hold=false, timeDate:boolean=true) : Promise<void> {
    let timeDateIndicator = timeDate ? "[" + new Date().toLocaleString().replace(", ", " at ") + "]" : "";
    let formattedMsg = `${timeDateIndicator} : ${LogLevel[logLevel].toUpperCase() === "CRITICAL" ? "CRITICAL ERROR" : LogLevel[logLevel].toUpperCase()} ==> ${msg}`;
    let logLevelString = LogLevel[logLevel].toLowerCase() as "debug" | "log" | "info" | "warn" | "error" | "critical";
    console[`${logLevelString === "critical" ? "error" : logLevelString}`](formattedMsg);
    if(!hold) { return await logOnGuild(bot, guild, logLevel, formattedMsg); }
    bot.logPipe.push([formattedMsg, logLevel]);
}