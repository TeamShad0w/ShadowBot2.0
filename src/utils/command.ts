import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';

//TODO : jsDoc
export interface IOptions {
    type : "String" | "Number" | "Integer" | "Boolean" | "User" | "Channel" | "Role" | "Mentionable" | "Attachment" | "Subcommand" | "SubcommandGroup";
    name : string,
    description : string,
    required? : boolean,
    choices? : Array<{
        name : string, value : string | number
    }>,
    options? : Array<IOptions>
}

// TODO : jsDoc
export default interface ICommand {
    name : string,
    description : string,
    permission : null | bigint,
    dm : boolean,
    options? : Array<IOptions>,
    run : (bot: ClientWithCommands, interaction:Discord.Interaction) => Promise<void>
}