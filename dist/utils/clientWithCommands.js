"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = tslib_1.__importDefault(require("discord.js"));
const configHandler_1 = tslib_1.__importDefault(require("./configHandler"));
class ClientWithCommands extends discord_js_1.default.Client {
    commands;
    guildHandlers;
    configHandler;
    logPipe = [];
    constructor(_config, _default, options) {
        super(options);
        this.commands = new discord_js_1.default.Collection();
        this.guildHandlers = new discord_js_1.default.Collection();
        this.configHandler = new configHandler_1.default(_config, _default);
    }
}
exports.default = ClientWithCommands;
