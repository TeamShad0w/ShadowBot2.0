import { LogLevel } from './consoleHandler';
import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';
import print from './consoleHandler';
import config from '../config.json';
import { tryFunction } from './tryFunction';
import fs from 'fs';
import { Iconfig } from './configHandler';

export interface IdatabaseDataHolder {
    url : string;
    APIKey : string;
}

export interface IGlobalGuildContainer {
    guildData : GuildHandler;
    id : Discord.Snowflake;
}

export interface IGuildHandlerVarArchitecture {
    id : Discord.Snowflake;
    database : IdatabaseDataHolder;
    logChannelID : Discord.Snowflake;
    logLevel : LogLevel;
}

export class GuildHandler {
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

async function createNewGuildData(bot : ClientWithCommands, guild:Discord.Guild) : Promise<void> {
    let guildData:GuildHandler = new GuildHandler(guild.id);
    bot.guildHandlers.set(guild, {
        guildData : guildData,
        id : guild.id
    });
    bot.config.config.guilds.push(guildData);
}

export default async function setHandlers(bot:ClientWithCommands): Promise<string | number> {
    let guildsData:Array<GuildHandler> = config.guilds;
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

    tryFunction(bot, bot.config.write);

    return 1;
}