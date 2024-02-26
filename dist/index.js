"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const config_json_1 = tslib_1.__importDefault(require("./config.json"));
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
async function main() {
    console.log("starting bot");
    let tryLogin = await login();
    if (tryLogin !== 1) {
        throw new Error(tryLogin.toString());
    }
    console.log("bot logged in");
}
main();
