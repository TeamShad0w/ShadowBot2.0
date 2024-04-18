import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';

/**
 * Hold the architecture of the different options that a command can have.
 */
export interface IOptions {
    type : "String" | "Number" | "Integer" | "Boolean" | "User" | "Channel" | "Role" | "Mentionable" | "Attachment" | "Subcommand" | "SubcommandGroup";
    name : string,
    description : string,
    required? : boolean,
    choices? : Array<{
        name : string, value : string | number
    }>,
    run? : (bot: ClientWithCommands, interaction:Discord.Interaction) => Promise<void>
    options? : Array<IOptions>
}

/**
 * Hold the architecture of a command (modules in the commands folder)
 */
export default interface ICommand {
    name : string,
    description : string,
    permission : null | bigint,
    dm : boolean,
    options? : Array<IOptions>,
    run : (bot: ClientWithCommands, interaction:Discord.Interaction) => Promise<void>
}