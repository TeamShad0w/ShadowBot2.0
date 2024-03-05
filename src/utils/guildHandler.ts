import { LogLevel, simplePrint } from './consoleHandler';
import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';
import print from './consoleHandler';
import config from '../config.json';
import { tryFunction } from './tryFunction';
import fs from 'fs';
import { Iconfig } from './configHandler';

// TODO : jsDoc
export interface ILogChannelDataHolder {
    id : Discord.Snowflake;
    logLevel : LogLevel;
}

// TODO : jsDoc
export interface IGlobalGuildContainer {
    guildData : GuildHandler;
    id : Discord.Snowflake;
}

// TODO : jsDoc
export interface IGuildHandlerVarArchitecture {
    id : Discord.Snowflake;
    logChannel : ILogChannelDataHolder;
}

// TODO : jsDoc
export type Node = "root" | "logChannel" | "logChannel.id" | "logChannel.logLevel";

// TODO : jsDoc
export class GuildHandler {
    id : Discord.Snowflake;
    logChannel : ILogChannelDataHolder;

    // TODO : jsDoc
    constructor(_id:Discord.Snowflake, _logChannel:ILogChannelDataHolder = { id : "-1", logLevel : LogLevel.Info}) {
        this.id = _id;
        this.logChannel = _logChannel;
    }

    // TODO : jsDoc
    modifyGuildSetup = async(bot:ClientWithCommands, _guild:Discord.Guild, builder:(guildData:IGuildHandlerVarArchitecture)=>Promise<IGuildHandlerVarArchitecture>|IGuildHandlerVarArchitecture) : Promise<void> => {
        if(!bot.configHandler.value.guilds.some(guild => guild.id === _guild.id)) { await createNewGuildData(bot, _guild) }
        let index = bot.configHandler.value.guilds.findIndex(guild => guild.id === _guild.id);
        bot.configHandler.value.guilds[index] = await builder(bot.configHandler.value.guilds[index]);
        await bot.configHandler.write(bot, _guild);
    }

    // TODO : jsDoc
    resetGuildData = async(node:Node, bot:ClientWithCommands, _guild:Discord.Guild) : Promise<IGuildHandlerVarArchitecture> => {
        let index = bot.configHandler.value.guilds.findIndex(guild => guild.id === _guild.id);
        let oldData = bot.configHandler.value.guilds.splice(index, 1)[0];
        await createNewGuildData(bot, _guild);
        return oldData;
    }
}

// TODO : jsDoc
export async function createNewGuildData(bot : ClientWithCommands, guild:Discord.Guild) : Promise<void> {
    let guildData:GuildHandler = new GuildHandler(guild.id);
    bot.guildHandlers.set(guild, {
        guildData : guildData,
        id : guild.id
    });
    bot.configHandler.modify(bot, guild, (config:Iconfig) => {
        let configBuffer = config;
        configBuffer.guilds.push(guildData);
        return configBuffer;
    });
}

// TODO : jsDoc
export default async function setHandlers(bot:ClientWithCommands): Promise<string | number> {
    let guildsData:Array<IGuildHandlerVarArchitecture> = bot.configHandler.value.guilds;
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
                guildData : new GuildHandler(guild.id, guildData.logChannel),
                id : guild.id
            });
            return false;
        })){
            createNewGuildData(bot, guild);
        }
    });
    return 1;
}