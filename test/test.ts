import { LogLevel } from '../src/utils/consoleHandler';
import Discord from 'discord.js'

interface IdatabaseDataHolder {
    url : string;
    APIKey : string;
}

class guildHandler {
    id : Discord.Snowflake;
    database : IdatabaseDataHolder;
    logChannelID : Discord.Snowflake;
    logLevel : LogLevel;

    constructor(_id:Discord.Snowflake, _databse:IdatabaseDataHolder = { url : "-1", APIKey : "-1" }, _logChannelID:Discord.Snowflake = "-1", _logLevel:LogLevel = LogLevel.Info) {
        this.id = _id;
        this.database = _databse;
        this.logChannelID = _logChannelID;
        this.logLevel = _logLevel;
    }
}

let guilds:Array<guildHandler> = [];

guilds.push(new guildHandler("54"))
guilds.push(new guildHandler("42"))

console.log(JSON.stringify(guilds, undefined, 4));