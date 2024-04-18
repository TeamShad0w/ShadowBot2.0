"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
exports.default = {
    name: "help",
    description: "replies with a list of commands",
    permission: null,
    dm: true,
    async run(bot, interaction) {
        let Way = path_1.default.dirname(path_1.default.dirname(__filename));
        let fmsg = "";
        fmsg += "Here the list of the commands and a short description :";
        fs_1.default.readdir(`${Way}/commands`, async (err, files) => {
            files.filter(f => f.endsWith("js") || f.endsWith("ts")).forEach(async (file, index, array) => {
                let command = await require(`${Way}/commands/${file}`).default;
                fmsg += `\r\n> **${command.name}** : *${command.description}*`;
                if (index === array.length - 1) {
                    interaction.followUp(fmsg);
                }
            });
        });
    }
};
