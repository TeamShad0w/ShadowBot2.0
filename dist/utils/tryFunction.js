"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tryFunction = void 0;
async function tryFunction(bot, callback) {
    let tryF = await callback(bot);
    if (tryF !== 1) {
        throw new Error(tryF.toString());
    }
}
exports.tryFunction = tryFunction;
