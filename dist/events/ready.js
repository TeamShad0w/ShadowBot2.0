"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const loadSlashInteractions_1 = tslib_1.__importDefault(require("../loaders/loadSlashInteractions"));
const consoleHandler_1 = tslib_1.__importStar(require("../utils/consoleHandler"));
const consoleHandler_2 = require("../utils/consoleHandler");
const tryFunction_1 = require("../utils/tryFunction");
const guildHandler_1 = tslib_1.__importDefault(require("../utils/guildHandler"));
exports.default = {
    listener: async (bot) => {
        if (bot.user === null) {
            return;
        }
        await (0, tryFunction_1.tryFunction)(bot, loadSlashInteractions_1.default);
        await (0, tryFunction_1.tryFunction)(bot, guildHandler_1.default);
        await (0, consoleHandler_1.releaseLogsFromPipe)(bot);
        (0, consoleHandler_1.default)(`${bot.user.username} online !`, consoleHandler_2.LogLevel.Info, bot, null);
    }
};
