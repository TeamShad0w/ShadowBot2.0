import { LogLevel, simplePrint } from './consoleHandler';
import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';
import print from './consoleHandler';
import config from '../config.json';
import { tryFunction } from './tryFunction';
import fs from 'fs';
import { Iconfig } from './configHandler';
import { setNestedProperty } from './objectNesting';

// TODO : jsDoc
export interface ILogChannelDataHolder {
    id : Discord.Snowflake;
    logLevel : LogLevel;
}

export async function isILogChannelDataHolderOfGuild(_object:unknown, guild:Discord.Guild) : Promise<boolean> {
    if(!_object) { return false; }
    let _objectTyped = _object as ILogChannelDataHolder;
    return _objectTyped.id !== undefined
        && (await guild.channels.fetch(_objectTyped.id)) !== null
        && _objectTyped.logLevel !== undefined
        && _objectTyped.logLevel in LogLevel;
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

export async function isIGuildHandlerVarArchitectureOfGuild(_object:unknown, guild:Discord.Guild) : Promise<boolean> {
    if(!_object) { return false; }
    let _objectTyped = _object as IGuildHandlerVarArchitecture;
    return _objectTyped.id !== undefined
        && _objectTyped.id === guild.id
        && await isILogChannelDataHolderOfGuild(_objectTyped.logChannel, guild);
}

// TODO : jsDoc
export type Node = "root" | "logChannel" | "logChannel.id" | "logChannel.logLevel";

// TODO : jsDoc
// TODO : automate this from 0.json ?
export function getInitialValueOfNode(node:Node) : any {
    switch (node) {
        case "root" : throw new Error("Root node don't have initial value without a guild attached.\r\nTo get a new GuildConfig, please use the constructor of the class GuildConfig.");
        case "logChannel" : return { id : "-1", logLevel : LogLevel.Info};
        case "logChannel.id" : return "-1";
        case "logChannel.logLevel" : return LogLevel.Info;
        default : throw new Error("Challenge completed : How did we get there ?\r\nA wrong value has been used for getInitialValueOfNode as TypeScript didn't say a word >:(\r\nBad TypeScript !");
    }
}

// TODO : jsDoc
export class GuildHandler {
    id : Discord.Snowflake;
    logChannel : ILogChannelDataHolder;

    // TODO : jsDoc
    constructor(_id:Discord.Snowflake, _logChannel:ILogChannelDataHolder = getInitialValueOfNode("logChannel")) {
        this.id = _id;
        this.logChannel = _logChannel;
    }

    // TODO : jsDoc
    modifyGuildSetup = async(bot:ClientWithCommands, _guild:Discord.Guild, builder:(guildData:IGuildHandlerVarArchitecture)=>Promise<IGuildHandlerVarArchitecture>|IGuildHandlerVarArchitecture) : Promise<void> => {
        if(!(await bot.configHandler.getValue()).guilds.some(guild => guild.id === _guild.id)) { await createNewGuildData(bot, _guild) }
        let index = (await bot.configHandler.getValue()).guilds.findIndex(guild => guild.id === _guild.id);
        (await bot.configHandler.getValue()).guilds[index] = await builder((await bot.configHandler.getValue()).guilds[index]);
        await bot.configHandler.write(bot, _guild);
    }

    // TODO : jsDoc
    resetGuildData = async(node:Node, bot:ClientWithCommands, _guild:Discord.Guild) : Promise<IGuildHandlerVarArchitecture> => {
        let index = (await bot.configHandler.getValue()).guilds.findIndex(guild => guild.id === _guild.id);
        let oldData = (await bot.configHandler.getValue()).guilds[index];
        if(node === "root") { 
            await bot.configHandler.modify(bot, _guild, (config:Iconfig) => {
                config.guilds.splice(index, 1);
                return config;
            });
            await createNewGuildData(bot, _guild);
        }else {
            await bot.configHandler.modify(bot, _guild, async (config:Iconfig) => {
                config.guilds[index] = await setNestedProperty<IGuildHandlerVarArchitecture>(config.guilds[index], node, getInitialValueOfNode(node));
                return config;
            });
        }
        return oldData;
    }

    isGuildDataOfGuild = async(data:any, guild:Discord.Guild) : Promise<Node | undefined> => {
        if(!data) { return undefined };
        if(await isIGuildHandlerVarArchitectureOfGuild(data, guild)) { return "root"; }
        if(await isILogChannelDataHolderOfGuild(data, guild)) { return "logChannel"; }
        if(data in LogLevel) { return "logChannel.logLevel"; }
        if((await guild.channels.fetch(data)) !== null) { return "logChannel.id"; }
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
    let guildsData:Array<IGuildHandlerVarArchitecture> = (await bot.configHandler.getValue()).guilds;
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