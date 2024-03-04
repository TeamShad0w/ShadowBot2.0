"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const consoleHandler_1 = require("../utils/consoleHandler");
const consoleHandler_2 = tslib_1.__importDefault(require("../utils/consoleHandler"));
const request_1 = tslib_1.__importDefault(require("request"));
exports.default = {
    name: "setup",
    description: "changes settings for how the bot should behave on your discord server",
    permission: discord_js_1.default.PermissionFlagsBits.ManageGuild,
    dm: false,
    options: [
        {
            name: "database",
            description: "all the settings for the database",
            type: "SubcommandGroup",
            options: [
                {
                    name: "url",
                    description: "change the url to connect to the server holding the database",
                    type: "Subcommand",
                    options: [
                        {
                            name: "url",
                            description: "the url of the server holding the database",
                            type: "String",
                            required: true
                        },
                        {
                            name: "return_data",
                            description: "wether or not to return the new data",
                            type: "Boolean"
                        }
                    ],
                    async run(bot, interaction) {
                        if (!interaction.guild) {
                            return;
                        }
                        bot.configHandler.modifyGuildSetup(bot, interaction.guild, guildData => {
                            guildData.database.url = interaction.options.getString("url") ?? "-1";
                            return guildData;
                        });
                        await interaction.followUp("This server setup has been changed.");
                    }
                },
                {
                    name: "api_key",
                    description: "change the api key to connect to the server holding the database",
                    type: "Subcommand",
                    options: [
                        {
                            name: "api_key",
                            description: "the api_key to identify the bot to the server",
                            type: "String",
                            required: true
                        },
                        {
                            name: "return_data",
                            description: "wether or not to return the new data",
                            type: "Boolean"
                        }
                    ],
                    async run(bot, interaction) {
                        if (!interaction.guild) {
                            return;
                        }
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
            name: "logs",
            description: "all the settings for the displayed logs",
            type: "SubcommandGroup",
            options: [
                {
                    name: "log_channel",
                    description: "the channel to display logs into",
                    type: "Subcommand",
                    options: [
                        {
                            name: "log_channel",
                            description: "the textual channel to set the log channel to",
                            type: "Channel",
                            required: true
                        },
                        {
                            name: "return_data",
                            description: "wether or not to return the new data",
                            type: "Boolean"
                        }
                    ],
                    async run(bot, interaction) {
                        if (!interaction.guild) {
                            return;
                        }
                        bot.configHandler.modifyGuildSetup(bot, interaction.guild, guildData => {
                            guildData.logChannel.id = interaction.options.getChannel("log_channel")?.id ?? "-1";
                            return guildData;
                        });
                        await interaction.followUp("This server setup has been changed.");
                    }
                },
                {
                    name: "log_level",
                    description: "the smallest level of log diplayed",
                    type: "Subcommand",
                    options: [
                        {
                            name: "log_level",
                            description: "the level to change for",
                            type: "Integer",
                            required: true,
                            choices: [
                                { name: "Debug", value: consoleHandler_1.LogLevel.Debug },
                                { name: "Log", value: consoleHandler_1.LogLevel.Log },
                                { name: "Info", value: consoleHandler_1.LogLevel.Info },
                                { name: "Warning", value: consoleHandler_1.LogLevel.Warning },
                                { name: "Error", value: consoleHandler_1.LogLevel.Error },
                                { name: "Critical", value: consoleHandler_1.LogLevel.Critical }
                            ]
                        },
                        {
                            name: "return_data",
                            description: "wether or not to return the new data",
                            type: "Boolean"
                        }
                    ],
                    async run(bot, interaction) {
                        if (!interaction.guild) {
                            return;
                        }
                        await bot.configHandler.modifyGuildSetup(bot, interaction.guild, async (guildData) => {
                            guildData.logChannel.logLevel = interaction.options.getInteger("log_level") ?? consoleHandler_1.LogLevel.Info;
                            return guildData;
                        });
                        await interaction.followUp("This server setup has been changed.");
                    }
                }
            ]
        },
        {
            name: "data",
            description: "manage all data stored about this server",
            type: "SubcommandGroup",
            options: [
                {
                    name: "reset",
                    description: "resets the guild data",
                    type: "Subcommand",
                    async run(bot, interaction) {
                        if (!interaction.guild) {
                            return;
                        }
                        const embed = new discord_js_1.default.EmbedBuilder()
                            .setColor(0x26c7d9)
                            .setTitle("Are you sure you want to reset this guild's data ?")
                            .setDescription("This action will return you the data erased in a JSON file so you can use the command `/setup data set` to reset to your old data.")
                            .setTimestamp();
                        const confirm = new discord_js_1.default.ButtonBuilder()
                            .setCustomId("confirm")
                            .setLabel("Erase Data")
                            .setStyle(discord_js_1.default.ButtonStyle.Danger);
                        const cancel = new discord_js_1.default.ButtonBuilder()
                            .setCustomId("cancel")
                            .setLabel("Nevermind I want to keep it")
                            .setStyle(discord_js_1.default.ButtonStyle.Success);
                        const row = new discord_js_1.default.ActionRowBuilder()
                            .addComponents(confirm, cancel);
                        const response = await interaction.followUp({
                            embeds: [embed],
                            components: [row]
                        });
                        let validationNotReceivedEmbed = new discord_js_1.default.EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle("Aborted data reset")
                            .setTimestamp();
                        try {
                            const confirmation = await response.awaitMessageComponent({ filter: (i) => i.user.id === interaction.user.id, time: 60_000 });
                            if (confirmation.customId === 'confirm') {
                                const oldData = await bot.configHandler.resetGuildData(bot, interaction.guild);
                                const operationDoneEmbed = new discord_js_1.default.EmbedBuilder()
                                    .setColor(0x43d927)
                                    .setTitle("Data reseted successfully")
                                    .setDescription("You can use the command `/setup data set` to reset to your old data using the json file provided above.")
                                    .setTimestamp();
                                await response.edit({
                                    embeds: [operationDoneEmbed],
                                    files: [new discord_js_1.default.AttachmentBuilder(Buffer.from(JSON.stringify(oldData, undefined, 4)), { name: "oldData.json" })],
                                    components: []
                                });
                            }
                            else if (confirmation.customId === 'cancel') {
                                validationNotReceivedEmbed.setDescription("User cancelled the operation.");
                                await response.edit({ embeds: [validationNotReceivedEmbed], components: [] });
                            }
                        }
                        catch (err) {
                            (0, consoleHandler_2.default)(err, consoleHandler_1.LogLevel.Error);
                            validationNotReceivedEmbed.setDescription("Confirmation not received within 60seconds.");
                            await response.edit({ embeds: [validationNotReceivedEmbed], components: [] });
                        }
                    }
                },
                {
                    name: "get",
                    description: "get all the data stored about this server",
                    type: "Subcommand",
                    options: [
                        {
                            name: "public",
                            description: "wether to make the message public or not",
                            type: "Boolean",
                            required: false
                        }
                    ],
                    async run(bot, interaction) {
                        if (!interaction.guild) {
                            return;
                        }
                        const ghostMsg = await interaction.followUp("Data fetched !");
                        await ghostMsg.delete();
                        await interaction.followUp({
                            content: "Here is the server's data stored by the bot",
                            files: [new discord_js_1.default.AttachmentBuilder(Buffer.from(JSON.stringify(await bot.configHandler.getGuildData(interaction.guild), undefined, 4)), { name: "data.json" })],
                            ephemeral: !(interaction.options.getBoolean("public") ?? false)
                        });
                    }
                },
                {
                    name: "set",
                    description: "set the stored data of this server to the specified json file",
                    type: "Subcommand",
                    options: [
                        {
                            name: "json_file",
                            description: "the file holding the data as json",
                            type: "Attachment",
                            required: true
                        }
                    ],
                    async run(bot, interaction) {
                        const file = interaction.options.getAttachment("json_file")?.url;
                        if (!file) {
                            return;
                        }
                        (0, request_1.default)(file, async (error, response, body) => {
                            if (error || !interaction.guild) {
                                return interaction.followUp("Oops, and error occured while fetching the attached file");
                            }
                            const data = await JSON.parse(body)[0];
                            await bot.configHandler.modifyGuildSetup(bot, interaction.guild, async (config) => data);
                            await interaction.followUp("The data has been successfully modified. You can ask for it with `/setup data get`.");
                        });
                    }
                }
            ]
        }
    ],
    async run(bot, interaction) {
        if (!interaction.guild) {
            return;
        }
        if (interaction.options.getBoolean("return_data")) {
            let data = JSON.stringify(await bot.configHandler.getGuildData(interaction.guild), undefined, 4);
            await interaction.followUp({ content: "Here is the new data : \r\n```json\r\n" + data + "```", ephemeral: true });
        }
    }
};
