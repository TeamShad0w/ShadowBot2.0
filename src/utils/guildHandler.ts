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
export function isNode(node:string) : node is Node {
    // TODO : find a better way to do this ?
    return node === "root" || node === "logChannel" || node === "logChannel.id" || node === "logChannel.logLevel";
}

export async function isValidProperty(bot:ClientWithCommands, node:string, value:any) : Promise<boolean> {
    if(!isNode(node)) { return false; }
    if(node === "logChannel.logLevel") { return value.toString() in Object.keys(LogLevel).filter(k => !Number.isNaN(Number.parseInt(k))); }
    let Tdefault = typeof await getNestedProperty((await bot.configHandler.getDefault()).guilds[0], node);
    return typeof value === typeof Tdefault;
}

// TODO : jsDoc
export class GuildHandler {
    id : Discord.Snowflake;
    logChannel : ILogChannelDataHolder;

    // TODO : jsDoc
    constructor(bot:ClientWithCommands, _id:Discord.Snowflake, _logChannel:ILogChannelDataHolder | undefined = undefined) {
        this.id = _id;
        if(!_logChannel) {
            //! This code may seems redundant but it prevent TypeScript from being a pain in the ass while replacing logLevel with his real default value later on.
            this.logChannel = { id: "-1", logLevel:2 };
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
}

// TODO : handle min max options in 0.json ? Because for now /setup data set with logLevel:42 modify the logLevel to 42 which shouldn't be possible
/**
 * Scans the given data and returns a list of nodes associated with their value.
 * @param {ClientWithCommands} bot The client of the bot (used for fetching default config values).
 * @param {any} data The data to scan.
 * @param {string} [path = "root"] The actual path the function is scanning from (evolves within the recursion) -- Default to "root".
 * @returns {Promise<Array<[Node | undefined, any]>>} A promise of list containing :
 * 
 * - The node of this branch of the given data, or undefined if not found;
 * - The value of this node;
 * - The reason for the error, or undefined if there was no error.
 */
export async function guildDataScanner(bot:ClientWithCommands, data:any, path:string="root") : Promise<Array<[Node | undefined, any, string | undefined]>> {
    let toReturn:Array<[Node | undefined, any, string | undefined]> = [];
    
    if(data === undefined || data === null) {
        let finalPath = path.replace("root.0.", "");
        toReturn.push(await isValidProperty(bot, finalPath, data) ? [finalPath as Node, data, undefined] : [undefined, data, "The given data is not a property of the server config file."]);
        return toReturn;
    }
    const keys = Object.keys(data);
    if(keys.length === 0 || typeof data === "string"){
        let finalPath = path.replace("root.0.", "");
        toReturn.push(await isValidProperty(bot, finalPath, data) ? [finalPath as Node, data, undefined] : [undefined, data, "The given data is not a property of the server config file."]);
        return toReturn;
    }

    toReturn = (await Promise.all(keys.flatMap(async key => {
        return await guildDataScanner(bot, data[key], path + "." + key);
    }))).flat();

    return toReturn;
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