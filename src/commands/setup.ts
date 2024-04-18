import Discord, { ActionRowBuilder, DiscordAPIError, EmbedBuilder, messageLink, Options, PresenceUpdateStatus } from 'discord.js';
import { LogLevel, simplePrint } from '../utils/consoleHandler';
import ClientWithCommands from '../utils/clientWithCommands';
import setHandlers, { IGuildHandlerVarArchitecture, Node, guildDataScanner} from '../utils/guildHandler';
import { tryFunction } from '../utils/tryFunction';
import print from '../utils/consoleHandler';
import { fstat } from 'fs';
import request from 'request';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { setNestedProperty } from '../utils/objectNesting';

export default {
    name : "setup",
    description : "changes settings for how the bot should behave on your discord server",
    permission : Discord.PermissionFlagsBits.ManageGuild,
    dm : false,
    options : [
        {
            name : "logs",
            description : "all the settings for the displayed logs",
            type : "SubcommandGroup",
            options : [
                {
                    name : "log_channel",
                    description : "the channel to display logs into",
                    type : "Subcommand",
                    options : [
                        {
                            name : "log_channel",
                            description : "the textual channel to set the log channel to",
                            type : "Channel",
                            required : true
                        },
                        {
                            name : "return_data",
                            description : "wether or not to return the new data",
                            type : "Boolean"
                        }
                    ],
                    //TODO : jsDoc
                    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
                        if(!interaction.guild) { return; }
                        await bot.guildHandlers.get(interaction.guild)?.guildData.modifyGuildSetup(bot, interaction.guild, guildData => {
                            guildData.logChannel.id = interaction.options.getChannel("log_channel")?.id ?? "-1";
                            return guildData;
                        });
                        await interaction.followUp("This server setup has been changed.");
                    }
                },
                {
                    name : "log_level",
                    description : "the smallest level of log diplayed",
                    type : "Subcommand",
                    options : [
                        {
                            name : "log_level",
                            description : "the level to change for",
                            type : "Integer",
                            required : true,
                            choices : [
                                { name : "Debug", value : LogLevel.Debug },
                                { name : "Log", value : LogLevel.Log },
                                { name : "Info", value : LogLevel.Info },
                                { name : "Warning", value : LogLevel.Warn },
                                { name : "Error", value : LogLevel.Error },
                                { name : "Critical", value : LogLevel.Critical }
                            ]
                        },
                        {
                            name : "return_data",
                            description : "wether or not to return the new data",
                            type : "Boolean"
                        }
                    ],
                    //TODO : jsDoc
                    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
                        if(!interaction.guild) { return; }
                        await bot.guildHandlers.get(interaction.guild)?.guildData.modifyGuildSetup(bot, interaction.guild, async guildData => {
                            guildData.logChannel.logLevel = interaction.options.getInteger("log_level") ?? LogLevel.Info;
                            return guildData;
                        });
                        await interaction.followUp("This server setup has been changed.");
                    }
                }
            ]
        },
        {
            name : "data",
            description : "manage all data stored about this server",
            type : "SubcommandGroup",
            options : [
                {
                    name : "reset",
                    description : "resets the guild data",
                    type : "Subcommand",
                    options : [
                        {
                            name : "node",
                            description : "the parameter of parameter group to reset",
                            type : "String",
                            choices : [
                                { name : "root.logChannel", value : "logChannel" },
                                { name : "root.logChannel.id", value : "logChannel.id" },
                                { name : "root.logChannel.logLevel", value : "logChannel.logLevel" }
                            ]
                        }
                    ],
                    //TODO : jsDoc
                    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void>{
                        if(!interaction.guild) { return; }
                        const node = (interaction.options.getString("node") ?? "root") as Node;
                        const embed = new Discord.EmbedBuilder()
                            .setColor(0x26c7d9)
                            .setTitle("Are you sure you want to reset this guild's data from the node : " + node)
                            .setDescription("This action will return you the data erased in a JSON file so you can use the command `/setup data set` to reset to your old data.")
                            .setTimestamp();
        
                        const confirm = new Discord.ButtonBuilder()
                            .setCustomId("confirm")
                            .setLabel("Erase Data")
                            .setStyle(Discord.ButtonStyle.Danger);
        
                        const cancel = new Discord.ButtonBuilder()
                            .setCustomId("cancel")
                            .setLabel("Nevermind I want to keep it")
                            .setStyle(Discord.ButtonStyle.Success);
        
                        const row = new Discord.ActionRowBuilder<Discord.ButtonBuilder>()
                            .addComponents(confirm, cancel);
                        
                        const response = await interaction.followUp({
                            embeds : [embed],
                            components : [row]
                        });
        
                        let validationNotReceivedEmbed = new Discord.EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("Aborted data reset")
                            .setTimestamp();
        
                        try {
                            // TODO : find confirmation interaction type for filter (       here ↓  and here ↓ )
                            const confirmation = await response.awaitMessageComponent({filter : (i : any) => i.user.id === interaction.user.id, time : 60_000});
                            if(confirmation.customId === 'confirm'){
                                const oldData = await bot.guildHandlers.get(interaction.guild)?.guildData.resetGuildData(node, bot, interaction.guild);
                                const operationDoneEmbed = new Discord.EmbedBuilder()
                                    .setColor(0x43d927)
                                    .setTitle("Data reseted successfully")
                                    .setDescription("You can use the command `/setup data set` to reset to your old data using the json file provided above.")
                                    .setTimestamp();
                                await response.edit({
                                    embeds : [operationDoneEmbed],
                                    files : [new Discord.AttachmentBuilder(
                                        Buffer.from(JSON.stringify(oldData, undefined, 4)),
                                        { name : "oldData.json"}
                                    )],
                                    components : []
                                });
                            }else if(confirmation.customId === 'cancel'){
                                validationNotReceivedEmbed.setDescription("User cancelled the operation.");
                                await response.edit({embeds : [validationNotReceivedEmbed], components : []});
                            }
                        }catch (err) {
                            print(err, LogLevel.Error, bot, interaction.guild);
                            validationNotReceivedEmbed.setDescription("Confirmation not received within 60seconds.");
                            await response.edit({embeds : [validationNotReceivedEmbed], components : []});
                        }
                    }
                },
                {
                    name : "get",
                    description : "get all the data stored about this server",
                    type : "Subcommand",
                    options : [
                        {
                            name : "public",
                            description : "wether to make the message public or not",
                            type : "Boolean",
                            required : false
                        }
                    ],
                    //TODO : jsDoc
                    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
                        if(!interaction.guild) { return; }
                        const ghostMsg = await interaction.followUp("Data fetched !");
                        await ghostMsg.delete();
                        await interaction.followUp({
                            content : "Here is the server's data stored by the bot",
                            files : [new Discord.AttachmentBuilder(
                                Buffer.from(JSON.stringify(await bot.configHandler.getGuildData(interaction.guild), undefined, 4)),
                                { name : "data.json" }
                            )],
                            ephemeral : !(interaction.options.getBoolean("public") ?? false)
                        });
                    }
                },
                {
                    name : "set",
                    description : "set the stored data of this server to the specified json file",
                    type : "Subcommand",
                    options : [
                        {
                            name : "json_file",
                            description : "the file holding the data as json",
                            type : "Attachment",
                            required : true
                        }
                    ],
                    //TODO : jsDoc
                    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
                        const file = interaction.options.getAttachment("json_file")?.url;
                        if(!file){ return; }
                        request(file, async (error, response, body) => {
                            if(error || !interaction.guild) {
                                return interaction.followUp("Oops, and error occured while fetching the attached file");
                            }
                            let data:any[] = []
                            try{
                                data = data.concat(await JSON.parse(body));
                            }catch(err){
                                await interaction.followUp("Oops, an error occured while fetching the data from the file.\r\nContact your administrator for more information.");
                                await print("An error occured while parsing the file's content to a data array.", LogLevel.Error, bot, interaction.guild);
                                return;
                            }
                            const results = await guildDataScanner(bot, data);
                            await interaction.followUp({
                                content : "",
                                embeds : await Promise.all(results.map(async (result) => {
                                    if(!interaction.guild) {
                                        return new Discord.EmbedBuilder()
                                            .setColor(0xFF0000)
                                            .setTitle("Critical Failure")
                                            .setDescription("An error occured while constructing the action report : unable to find the guild the interaction was sent from.")
                                            .addFields([
                                                {
                                                    name : "Data :",
                                                    value : "```json\r\n" + JSON.stringify(result[1], undefined, 4) + "```"
                                                },
                                                {
                                                    name :"Response",
                                                    value : "Ommited data"
                                                }
                                            ]);
                                    }
                                    let good:boolean = false;
                                    if(result[0]){
                                        await bot.guildHandlers.get(interaction.guild)?.guildData.modifyGuildSetup(bot, interaction.guild, async guildData => {
                                            return result[0] ? setNestedProperty(guildData, result[0], result[1]) : guildData;
                                        });
                                    }
                                    await interaction.followUp("This server setup has been changed.");
                                    return new Discord.EmbedBuilder()
                                        .setColor(result[0]
                                            ? 0x00FF00
                                            : 0xd6520d)
                                        .setTitle(result[0]
                                            ? "Success :"
                                            : "Error :")
                                        .setDescription(result[0]
                                            ? "The following data was successfully set."
                                            : "The following data was omitted for : `" + result[2] + "`")
                                        .addFields([
                                            {
                                                name : "Data :",
                                                value : "```json\r\n" + JSON.stringify(result[1], undefined, 4) + "```"
                                            },
                                            {
                                                name : "Response :",
                                                value : result[0] && !result[2]
                                                ? "Tried to modify data"
                                                : result[2] ?? "No error message was thrown."
                                            }
                                        ]);
                                }))
                            });
                            if(results.every(result => result[0] !== undefined)){
                                await interaction.followUp("The data has been successfully modified. You can ask for it with `/setup data get`.");
                            }
                        });
                    }
                }
            ]
        }
    ],

    //TODO : jsDoc
    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void> {
        if(!interaction.guild) { return; }
        if(interaction.options.getBoolean("return_data")) {
            let data = JSON.stringify(await bot.configHandler.getGuildData(interaction.guild), undefined, 4);
            await interaction.followUp({ content : "Here is the new data : \r\n```json\r\n" + data + "```", ephemeral : true });
        }
    }
}