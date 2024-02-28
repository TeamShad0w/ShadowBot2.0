import Discord from 'discord.js';
import ClientWithCommands from './clientWithCommands';

export enum CommandOptionType {
    String,
    Integer,
    Number,
    Boolean,
    User,
    Channel,
    Role,
    Mentionable,
    Attachment,
    Subcommand
}

// TODO : jsDoc
export default interface ICommand {
    name : string,
    description : string,
    permission : null | bigint,
    dm : boolean,
    options? : Array<{
        type : CommandOptionType,
        name : string,
        description : string
        required : boolean,
        choices? : Array<{
            name : string, value : string
        }>
    }>,
    run : (bot: ClientWithCommands, interaction:Discord.Interaction) => Promise<void>
}