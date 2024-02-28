import { IGuildHandlerVarArchitecture } from './guildHandler'; // TODO : create guild handler
import fs from 'fs';

export interface Iconfig {
    token : string;
    guilds : Array<IGuildHandlerVarArchitecture>;
}

export default class ConfigHandler {
    config : Iconfig;

    constructor(_config : Iconfig) {
        this.config = _config;
    };

    async write() : Promise<string | number> {
        
        try{
            fs.writeFileSync('../config.json', JSON.stringify(this.config, undefined, 4));
        }catch(err) {
            return "Wasn't able to write config.json : " + err;
        }
        return 1;
    }
}