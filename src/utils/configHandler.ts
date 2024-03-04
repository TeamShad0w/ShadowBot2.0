import { IGuildHandlerVarArchitecture, createNewGuildData } from './guildHandler';
import print from './consoleHandler';
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
    value : Iconfig;

    constructor(_config : Iconfig) {
        this.value = _config;
    };

    // TODO : jsDoc
    modify = async (modifingFunction:(config:Iconfig)=>Promise<Iconfig>|Iconfig) : Promise<void> => {
        this.value = await modifingFunction(this.value);
        this.write();
    }

    // TODO : jsDoc
    modifyGuildSetup = async(bot:ClientWithCommands, _guild:Discord.Guild, builder:(guildData:IGuildHandlerVarArchitecture)=>Promise<IGuildHandlerVarArchitecture>|IGuildHandlerVarArchitecture) : Promise<void> => {
        if(!this.value.guilds.some(guild => guild.id === _guild.id)) { await createNewGuildData(bot, _guild) }
        let index = this.value.guilds.findIndex(guild => guild.id === _guild.id);
        this.value.guilds[index] = await builder(this.value.guilds[index]);
        await this.write();
    }

    // TODO : jsDoc
    resetGuildData = async(bot:ClientWithCommands, _guild:Discord.Guild) : Promise<IGuildHandlerVarArchitecture> => {
        let index = this.value.guilds.findIndex(guild => guild.id === _guild.id);
        let oldData = this.value.guilds.splice(index, 1)[0];
       await createNewGuildData(bot, _guild);
       return oldData;
    }

    // TODO : jsDoc
    getGuildData = async(_guild:Discord.Guild) : Promise<Array<IGuildHandlerVarArchitecture>> => {
        return this.value.guilds.filter(guild => guild.id === _guild.id);
    }

    // TODO : jsDoc
    write = async () : Promise<string | number> => {
        try{
            let Way:string = path.dirname(path.dirname(__filename));
            fs.writeFileSync(`${Way}/config.json`, JSON.stringify(this.value, undefined, 4));
            print("config.json modified", LogLevel.Log)
        }catch(err) {
            return "Wasn't able to write config.json : " + err;
        }
        return 1;
    }
}