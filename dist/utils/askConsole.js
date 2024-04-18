"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const readline_1 = tslib_1.__importDefault(require("readline"));
async function askConsole(question) {
    let rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout });
    return await new Promise(resolve => {
        rl.question("next ?", answr => {
            rl.close();
            resolve(answr);
        });
    });
}
exports.default = askConsole;
