import { LogLevel, simplePrint } from './consoleHandler';
import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';
import print from './consoleHandler';
import config from '../config.json';
import { tryFunction } from './tryFunction';
import fs from 'fs';
import { Iconfig } from './configHandler';
import { setNestedProperty, getNestedProperty } from './objectNesting';

// TODO : jsDoc
export interface ILogChannelDataHolder {
    id : Discord.Snowflake;
    logLevel : LogLevel;
}

export async function isILogChannelDataHolderOfGuild(_object:unknown, guild:Discord.Guild) : Promise<boolean> {
    if(!_object) { return false; }
    let _objectTyped = _object as ILogChannelDataHolder;
    return _objectTyped.id !== undefined
        && (guild.channels.cache.get(_objectTyped.id)) !== undefined
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
    logChannel : ILogChannelDataHolder | undefined;
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
export class GuildHandler {
    id : Discord.Snowflake;
    logChannel : ILogChannelDataHolder | undefined;

    // TODO : jsDoc
    constructor(bot:ClientWithCommands, _id:Discord.Snowflake, _logChannel:ILogChannelDataHolder | undefined = undefined) {
        this.id = _id;
        if(!_logChannel) {
            bot.configHandler.getDefault().then(defaultConfig => {
                getNestedProperty(defaultConfig, "guilds.0.logChannel").then(defaultValue => {
                    this.logChannel = defaultValue;
                    bot.guilds.fetch(this.id).then(guild => {
                        this.modifyGuildSetup(bot, guild, guildData => {
                            guildData.logChannel = this.logChannel;
                            return guildData;
                        });
                    });
                });
            });
        }else{
            this.logChannel = _logChannel;
        }
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
                config.guilds[index] = await setNestedProperty<IGuildHandlerVarArchitecture>(config.guilds[index], node, getNestedProperty(bot.configHandler.getValue(), "guilds.0." + node));
                return config;
            });
        }
        return oldData;
    }

    isGuildDataOfGuild = async(data:any, guild:Discord.Guild) : Promise<[Node | undefined, any]> => {
        if(!data) { return [undefined, data] };
        if(await isIGuildHandlerVarArchitectureOfGuild(data, guild)) { return ["root", data]; }
        if(await isILogChannelDataHolderOfGuild(data, guild)) { return ["logChannel", data]; }
        if(data in LogLevel) { return ["logChannel.logLevel", data]; }
        try {
            if((await guild.channels.fetch(data)) !== null) { return ["logChannel.id", data]; }
        }catch (err) {}
        let keys = Object.keys(data);
        if(keys.length === 1) {
            return this.isGuildDataOfGuild(data[keys[0]], guild);
        }
        return [undefined, data];
    }
}

// TODO : jsDoc
export async function createNewGuildData(bot : ClientWithCommands, guild:Discord.Guild) : Promise<void> {
    let guildData:GuildHandler = new GuildHandler(bot, guild.id);
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
                guildData : new GuildHandler(bot, guild.id, guildData.logChannel),
                id : guild.id
            });
            return false;
        })){
            createNewGuildData(bot, guild);
        }
    });
    return 1;
}