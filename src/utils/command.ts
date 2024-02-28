import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';

export default interface ICommand {
    name : string,
    description : string,
    permission : null | bigint,
    dm : boolean,
    run : (bot: ClientWithCommands, interaction:Discord.Interaction) => Promise<void>
}