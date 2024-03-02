import { IGuildHandlerVarArchitecture } from './guildHandler';
import print from './consoleHandler';
import { LogLevel } from './consoleHandler';
import fs from 'fs';
import path from "path";

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
    modify = async (modifingFunction:(config:Iconfig)=>Promise<Iconfig>|Iconfig) => {
        this.value = await modifingFunction(this.value);
        this.write();
    }

    // TODO : jsDoc
    write = async () : Promise<string | number> => {
        try{
            let Way:string = path.dirname(path.dirname(__filename));
            fs.writeFile(`${Way}/config.json`, JSON.stringify(this.value, undefined, 4), () => print("config.json modified", LogLevel.Log));
        }catch(err) {
            return "Wasn't able to write config.json : " + err;
        }
        return 1;
    }
}