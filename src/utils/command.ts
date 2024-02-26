import Discord from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';

interface runFunctionType {
    async (bot: ClientWithCommands, msg:Discord.Message, interaction:Discord.Interaction) : Promise<void>;
}

export default interface ICommand {
    name : string,
    description : string,
    permission : null | bigint,
    dm : boolean,
    run : runFunctionType
}