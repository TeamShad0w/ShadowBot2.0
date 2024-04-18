"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function findSubcommand(root, name, bot, interaction) {
    if (!root.options) {
        return;
    }
    await Promise.all(root.options.map(async (option) => {
        if (option.type !== 'Subcommand') {
            return option;
        }
        if (!option.run) {
            throw new Error(`Subcommand ${option.name} have no run function.\r\n`);
        }
        if (option.name !== name) {
            return option;
        }
        await option.run(bot, interaction);
    }));
}
async function subcomandRunner(bot, interaction, command) {
    if (!command.options || !interaction.options.getSubcommand()) {
        return;
    }
    if (command.options.every(option => option.type !== 'Subcommand' && option.type !== 'SubcommandGroup')) {
        return;
    }
    if (interaction.options.getSubcommandGroup() === null) {
        return await findSubcommand(command, interaction.options.getSubcommand(), bot, interaction);
    }
    await Promise.all(command.options.map(async (option) => {
        if (option.type !== 'SubcommandGroup') {
            return;
        }
        if (!option.options || option.options.every(option => option.type !== 'Subcommand')) {
            throw new Error(`Subcommand group ${option.name} have no subcommands.\r\n`);
        }
        if (option.name !== interaction.options.getSubcommandGroup()) {
            return;
        }
        await findSubcommand(option, interaction.options.getSubcommand(), bot, interaction);
    }));
}
exports.default = subcomandRunner;
