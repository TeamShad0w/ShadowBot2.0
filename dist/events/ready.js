"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const loadSlashInteractions_1 = tslib_1.__importDefault(require("../loaders/loadSlashInteractions"));
const consoleHandler_1 = tslib_1.__importDefault(require("../utils/consoleHandler"));
const consoleHandler_2 = require("../utils/consoleHandler");
const tryFunction_1 = require("../utils/tryFunction");
exports.default = {
    listener: async (bot) => {
        (0, consoleHandler_1.default)("ready");
        if (bot.user === null) {
            return;
        }
        await (0, tryFunction_1.tryFunction)(bot, loadSlashInteractions_1.default);
        (0, consoleHandler_1.default)(`${bot.user.username} online !`, consoleHandler_2.LogLevel.Info);
    }
};
