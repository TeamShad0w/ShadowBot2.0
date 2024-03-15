import { IGuildHandlerVarArchitecture, createNewGuildData } from './guildHandler';
import print, { simplePrint } from './consoleHandler';
import { LogLevel } from './consoleHandler';
import fs from 'fs';
import path from "path";
import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';

// TODO : jsDoc
export interface Iconfig {
    token : string;
    guilds : Array<IGuildHandlerVarArchitecture>;
}

// TODO : jsDoc
export default class ConfigHandler {
    private value : Iconfig;
    private default : Iconfig;

    constructor(_config : Iconfig, _default : Iconfig) {
        this.value = _config;
        this.default = _default;
    };

    // TODO : jsDoc
    getValue = async () : Promise<Iconfig> => {
        return this.value;
    }

    // TODO : jsDoc
    getDefault = async () : Promise<Iconfig> => {
        return this.default;
    }

    // TODO : jsDoc
    modify = async (bot:ClientWithCommands, guild:Discord.Guild, modifingFunction:(config:Iconfig)=>Promise<Iconfig>|Iconfig) : Promise<void> => {
        this.value = await modifingFunction(this.value);
        this.write(bot, guild);
    }

    // TODO : jsDoc
    getGuildData = async(_guild:Discord.Guild) : Promise<Array<IGuildHandlerVarArchitecture>> => {
        return this.value.guilds.filter(guild => guild.id === _guild.id);
    }

    // TODO : jsDoc
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