"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const config_json_1 = tslib_1.__importDefault(require("./config.json"));
const loadCommands_1 = tslib_1.__importDefault(require("./loaders/loadCommands"));
const loadDatabase_1 = tslib_1.__importDefault(require("./loaders/loadDatabase"));
const loadEvents_1 = tslib_1.__importDefault(require("./loaders/loadEvents"));
const loadSlashInteractions_1 = tslib_1.__importDefault(require("./loaders/loadSlashInteractions"));
const bot = new discord_js_1.default.Client({
    intents: [3276799]
});
async function login() {
    try {
        await bot.login(config_json_1.default.token);
    }
    catch (err) {
        return "bot couldn't login : " + err;
    }
    return 1;
}
async function tryFunction(bot, callback) {
    let tryF = await callback(bot);
    if (tryF !== 1) {
        throw new Error(tryF.toString());
    }
}
async function main() {
    console.log("starting bot");
    tryFunction(bot, login);
    console.log("bot logged in");
    console.log("connecting to database");
    tryFunction(bot, loadDatabase_1.default);
    console.log("connected to database");
    console.log("loading events");
    tryFunction(bot, loadEvents_1.default);
    console.log("events loaded");
    console.log("loading commands");
    tryFunction(bot, loadCommands_1.default);
    console.log("commands loaded");
    console.log("loading slash intercations");
    tryFunction(bot, loadSlashInteractions_1.default);
    console.log("slash interactions loaded");
}
main();
