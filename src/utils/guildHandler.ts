import { LogLevel } from './consoleHandler';
import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';
import print from './consoleHandler';
import config from '../config.json';
import { tryFunction } from './tryFunction';
import fs from 'fs';
import { Iconfig } from './configHandler';

// TODO : jsDoc
export interface IdatabaseDataHolder {
    url : string;
    APIKey : string;
}

// TODO : jsDoc
export interface IGlobalGuildContainer {
    guildData : GuildHandler;
    id : Discord.Snowflake;
}

// TODO : jsDoc
export interface IGuildHandlerVarArchitecture {
    id : Discord.Snowflake;
    database : IdatabaseDataHolder;
    logChannelID : Discord.Snowflake;
    logLevel : LogLevel;
}

// TODO : jsDoc
export class GuildHandler {
    id : Discord.Snowflake;
    database : IdatabaseDataHolder;
    logChannelID : Discord.Snowflake;
    logLevel : LogLevel;

    // TODO : jsDoc
    constructor(_id:Discord.Snowflake, _databse:IdatabaseDataHolder = { url : "-1", APIKey : "-1" }, _logChannelID:Discord.Snowflake = "-1", _logLevel:LogLevel = LogLevel.Info) {
        this.id = _id;
        this.database = _databse;
        this.logChannelID = _logChannelID;
        this.logLevel = _logLevel;
    }
}

// TODO : jsDoc
async function createNewGuildData(bot : ClientWithCommands, guild:Discord.Guild) : Promise<void> {
    let guildData:GuildHandler = new GuildHandler(guild.id);
    bot.guildHandlers.set(guild, {
        guildData : guildData,
        id : guild.id
    });
    bot.configHandler.modify((config:Iconfig) => {
        let configBuffer = config;
        configBuffer.guilds.push(guildData);
        return configBuffer;
    });
}

// TODO : jsDoc
export default async function setHandlers(bot:ClientWithCommands): Promise<string | number> {
    let guildsData:Array<GuildHandler> = bot.configHandler.value.guilds;
    bot.guilds.cache.each(guild => {

        if (guildsData.length === 0) {
            createNewGuildData(bot, guild)
            return;
        }

        if(guildsData.every((guildData, index, guildsData) => {
            if (guildData.id !== guild.id){
                return true;
            }
            bot.guildHandlers.set(guild, {
                guildData : new GuildHandler(guild.id, guildData.database, guildData.logChannelID, guildData.logLevel),
                id : guild.id
            });
            return false;
        })){
            createNewGuildData(bot, guild);
        }
    });
    return 1;
}