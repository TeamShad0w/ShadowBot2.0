import { IGuildHandlerVarArchitecture } from './guildHandler'; // TODO : create guild handler
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
    config : Iconfig;

    constructor(_config : Iconfig) {
        this.config = _config;
    };

    // TODO : jsDoc
    modify = async (modifingFunction:(config:Iconfig)=>Promise<Iconfig>|Iconfig) => {
        this.config = await modifingFunction(this.config);
        this.write();
    }

    // TODO : jsDoc
    write = async () : Promise<string | number> => {
        try{
            let Way:string = path.dirname(path.dirname(__filename));
            fs.writeFile(`${Way}/config.json`, JSON.stringify(this.config, undefined, 4), () => print("config.json modified", LogLevel.Log));
        }catch(err) {
            return "Wasn't able to write config.json : " + err;
        }
        return 1;
    }
}