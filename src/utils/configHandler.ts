import { IGuildHandlerVarArchitecture, createNewGuildData } from './guildHandler';
import print, { simplePrint } from './consoleHandler';
import { LogLevel } from './consoleHandler';
import fs from 'fs';
import path from "path";
import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';

/**
 * A async or sync function that modify an Iconfig variable
 * @param {Iconfig} config The entry data
 * @returns {Promise<Iconfig>|Iconfig} The processed data
 */
type configModifyingFunc = (config:Iconfig) => Promise<Iconfig>|Iconfig

/**
 * The architecture of the stored data, at the root of the json file
 */
export interface Iconfig {
    token : string;
    devStage : boolean;
    guilds : Array<IGuildHandlerVarArchitecture>;
}

/**
 * This class contains the default and actual stored data as well as methods to process it.
 */
export default class ConfigHandler {
    /** The stored data */
    private value : Iconfig;
    /** The default values of all properties in the json file */
    private default : Iconfig;

    /**
     * Initialize the ConfigHandler class
     * @param _config 
     * @param _default 
     */
    constructor(_config : Iconfig, _default : Iconfig) {
        this.value = _config;
        this.default = _default;
    };

    /**
     * Used to acess the value of the data (it is private) 
     * @returns {Promise<Iconfig>} The data
     **/
    getValue = async () : Promise<Iconfig> => {
        return this.value;
    }

    /**
     * Used to acess the default value of the data (it is private) 
     * @returns {Promise<Iconfig>} The default value of the data
     **/
    getDefault = async () : Promise<Iconfig> => {
        return this.default;
    }
    
    /**
     * Used to modify the data held (it is private)
     * @param {ClientWithCommands} bot The bot's client 
     * @param {Discord.Guild} guild The guild whose data should be modified
     * @param {configModifyingFunc} modifingFunction 
     */
    modify = async (bot:ClientWithCommands, guild:Discord.Guild, modifingFunction:configModifyingFunc) : Promise<void> => {
        this.value = await modifingFunction(this.value);
        this.write(bot, guild);
    }

    /**
     * Used to get a guild data from a Discord guild
     * @param {Discord.Guild} _guild The guild whose data is requested 
     * @returns {Promise<Array<IGuildHandlerVarArchitecture>>} The guild's data
     */
    getGuildData = async(_guild:Discord.Guild) : Promise<Array<IGuildHandlerVarArchitecture>> => {
        return this.value.guilds.filter(guild => guild.id === _guild.id);
    }

    /**
     * Writes the held data to the config.json file
     * @param {ClientWithCommands} bot The bot's client
     * @param {Discord.Guild} guild Where to put the logs from the execution of this function
     * @returns {Promise<string|number>} 1 if executed properly, and error message otherwise
     */
    write = async (bot:ClientWithCommands, guild:Discord.Guild) : Promise<string | number> => {
        try{
            let Way:string = path.dirname(path.dirname(__filename));
            fs.writeFileSync(`${Way}/config.json`, JSON.stringify(this.value, undefined, 4));
            print("config.json modified", LogLevel.Log, bot, guild)
        }catch(err) {
            return "Wasn't able to write config.json : " + err;
        }
        return 1;
    }
}