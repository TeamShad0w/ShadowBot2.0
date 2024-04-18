"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "ping",
    description: "replies with pong",
    permission: null,
    dm: true,
    async run(bot, interaction) {
        await interaction.followUp("pong");
    }
};
