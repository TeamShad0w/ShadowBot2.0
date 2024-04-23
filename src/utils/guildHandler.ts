import { LogLevel } from './consoleHandler';
import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';
import { Iconfig } from './configHandler';
import { setNestedProperty, getNestedProperty } from './objectNesting';

/**
 * A async or sync function that modify an guild data
 * @param {IGuildHandlerVarArchitecture} config The entry data
 * @returns {Promise<IGuildHandlerVarArchitecture>|IGuildHandlerVarArchitecture} The processed data
 */
type guildDataModifyingFunc = (guildData:IGuildHandlerVarArchitecture)=>Promise<IGuildHandlerVarArchitecture>|IGuildHandlerVarArchitecture;

/** The interface of the stored data about the log channel */
export interface ILogChannelDataHolder {
    /** The ID of the log channel */
    id : Discord.Snowflake;
    /** The log level of this guild */
    logLevel : LogLevel;
}

/** The interface of the stored data bout a guild */
export interface IGuildHandlerVarArchitecture {
    /** The ID of the guild */
    id : Discord.Snowflake;
    /** The log channel's data */
    logChannel : ILogChannelDataHolder;
    /** The ID of the channel in wich to display kick embeds */
    kickChannelID : Discord.Snowflake;
    /** The ID of the channel in wich to display ban embeds */
    banChannelID : Discord.Snowflake;
}

// ? find a way to automate this ?
/** The different nodes of a guild's data*/
export type Node = "root" | "logChannel" | "logChannel.id" | "logChannel.logLevel" | "banChannelID" | "kickChannelID";
/**
 * Returns true if the given string is of type Node
 * @param {string} node The string to test
 * @returns {boolean}
 */
export function isNode(node:string) : node is Node {
    // TODO : find a better way to do this ?
    // ! redundant with line 27
    return node === "root" || node === "logChannel" || node === "logChannel.id" || node === "logChannel.logLevel" || node === "banChannelID" || node === "kickChannelID";
}

/**
 * Test wether or not a given duo (string/value) correspond to any of the duos (node/value) of a guild data
 * 
 * (value must be correct type for the given node if it is one)
 * @param {ClientWithCommands} bot The bot's client, used to get the default values of a guild data
 * @param {string} node The string of the duo to test
 * @param {any} value The value of the duo to test
 * @returns {Promise<boolean>} Wether or not this duo is valid
 */
export async function isValidProperty(bot:ClientWithCommands, node:string, value:any) : Promise<boolean> {
    if(!isNode(node)) { return false; }
    if(node === "logChannel.logLevel") { return value.toString() in Object.keys(LogLevel).filter(k => !Number.isNaN(Number.parseInt(k))); }
    let Tdefault = typeof await getNestedProperty((await bot.configHandler.getDefault()).guilds[0], node);
    return typeof value === typeof Tdefault;
}

/** The class holding a guild's data and methods to process it */
export class GuildHandler implements IGuildHandlerVarArchitecture {
    id : Discord.Snowflake;
    logChannel : ILogChannelDataHolder;
    kickChannelID : Discord.Snowflake;
    banChannelID : Discord.Snowflake;

    /**
     * Constructs a new GuildHandler class from the guild's id and the default values of a guild data (stored in 0.json)
     * @param {Discord.Snowflake} _id The guild's ID
     * @param {Iconfig} _default The default value of a guild data
     */
    constructor(_id:Discord.Snowflake, _default:Iconfig)
    /**
     * Constructs a new GuildHandler class from the guild's data
     * @param {IGuildHandlerVarArchitecture} _data The guild's data
     */
    constructor(_data:IGuildHandlerVarArchitecture)
    constructor(arg1:Discord.Snowflake | IGuildHandlerVarArchitecture, _default?:Iconfig) {
        const data = _default ? _default.guilds[0] : arg1
        if(typeof data === "string") { throw new Error("The typescript overload didn't work as intended and this function has been called : new GuildHandler(_id:string);"); }
        this.id = typeof arg1 === "string" ? arg1 : data.id;
        // TODO : find a way to do this automatically
        this.logChannel = data.logChannel;
        this.kickChannelID = data.kickChannelID;
        this.banChannelID = data.banChannelID;
    }

    /**
     * Modifies the held data by passing it as an argument of a function and taking the returned data as the new one
     * @param {ClientWithCommands} bot The bot's client
     * @param {Discord.Guild} _guild The guild whose data is modified
     * @param {guildDataModifyingFunc} builder The function in wich the data is passed
     * @returns {Promise<void>}
     */
    modifyGuildSetup = async(bot:ClientWithCommands, _guild:Discord.Guild, builder:guildDataModifyingFunc) : Promise<void> => {
        if(!(await bot.configHandler.getValue()).guilds.some(guild => guild.id === _guild.id)) { await createNewGuildData(bot, _guild); }
        let index = (await bot.configHandler.getValue()).guilds.findIndex(guild => guild.id === _guild.id);
        (await bot.configHandler.getValue()).guilds[index] = await builder((await bot.configHandler.getValue()).guilds[index]);
        await bot.configHandler.write(bot, _guild);
    }

    /**
     * This functions resets a guildHandler class's properties to their default values as well as the data held in the json file
     * @param {Node} node the parent node of all the data to be reset
     * @param {ClientWithCommands} bot The bot's client
     * @param {Discord.Guild} _guild The guild whose data is reset
     * @returns {Promise<IGuildHandlerVarArchitecture>} The data as it was before
     */
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

/**
 * Creates a new guildHandler and adds it to the bot's client collection.
 * @param {ClientWithCommands} bot The bot's client
 * @param {Discord.Guild} guild The guild whose data is parsed into the new guildHandler class
 */
export async function createNewGuildData(bot : ClientWithCommands, guild:Discord.Guild) : Promise<void> {
    let guildHandler = new GuildHandler(guild.id, await bot.configHandler.getDefault());
    bot.guildHandlers.set(guild, guildHandler);
    bot.configHandler.modify(bot, guild, (config:Iconfig) => {
        let configBuffer = config;
        configBuffer.guilds.push(guildHandler);
        return configBuffer;
    });
}

/**
 * Setups all the needed guildHandler classes from the guilds the bot is in
 * @param {ClientWithCommands} bot The bot's client
 * @returns {Promise<string|number>} 1 if executed withour errors, the error message otherwise
 */
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
            bot.guildHandlers.set(guild, new GuildHandler(guildData));
            return false;
        })){
            createNewGuildData(bot, guild);
        }
    });
    return 1;
}