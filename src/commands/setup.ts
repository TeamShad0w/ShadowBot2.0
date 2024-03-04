import Discord, { ActionRowBuilder, DiscordAPIError, messageLink, Options } from 'discord.js';
import { LogLevel } from '../utils/consoleHandler';
import ClientWithCommands from '../utils/clientWithCommands';
import setHandlers, { IGuildHandlerVarArchitecture } from '../utils/guildHandler';
import { tryFunction } from '../utils/tryFunction';
import print from '../utils/consoleHandler';
import { fstat } from 'fs';
import request from 'request';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export default {
    name : "setup",
    description : "changes settings for how the bot should behave on your discord server",
    permission : Discord.PermissionFlagsBits.ManageGuild,
    dm : false,
    options : [
        {
            name : "database",
            description : "all the settings for the database",
            type : "SubcommandGroup",
            options : [
                {
                    name : "url",
                    description : "change the url to connect to the server holding the database",
                    type : "Subcommand",
                    options : [
                        {
                            name : "url",
                            description : "the url of the server holding the database",
                            type : "String",
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
                        bot.configHandler.modifyGuildSetup(bot, interaction.guild, guildData => {
                            guildData.database.url = interaction.options.getString("url") ?? "-1";
                            return guildData;
                        });
                        await interaction.followUp("This server setup has been changed.");
                    }
                },
                {
                    name : "api_key",
                    description : "change the api key to connect to the server holding the database",
                    type : "Subcommand",
                    options : [
                        {
                            name : "api_key",
                            description : "the api_key to identify the bot to the server",
                            type : "String",
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
                        bot.configHandler.modifyGuildSetup(bot, interaction.guild, guildData => {
                            guildData.database.APIKey = interaction.options.getString("api_key") ?? "-1";
                            return guildData;
                        });
                        await interaction.followUp("This server setup has been changed.");
                    }
                }
            ]
        },
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
                        bot.configHandler.modifyGuildSetup(bot, interaction.guild, guildData => {
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
                                { name : "Warning", value : LogLevel.Warning },
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
                        await bot.configHandler.modifyGuildSetup(bot, interaction.guild, async guildData => {
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
                    //TODO : jsDoc
                    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction): Promise<void>{
                        if(!interaction.guild) { return; }
                        const embed = new Discord.EmbedBuilder()
                            .setColor(0x26c7d9)
                            .setTitle("Are you sure you want to reset this guild's data ?")
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
                                const oldData = await bot.configHandler.resetGuildData(bot, interaction.guild);
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
                            print(err, LogLevel.Error);
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
                            const data:IGuildHandlerVarArchitecture = await JSON.parse(body)[0];
                            await bot.configHandler.modifyGuildSetup(bot, interaction.guild, async config => data);
                            await interaction.followUp("The data has been successfully modified. You can ask for it with `/setup data get`.");
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