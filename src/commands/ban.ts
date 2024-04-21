import Discord, { ChatInputCommandInteraction, Interaction, messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand from '../utils/command';
import print, { LogLevel } from '../utils/consoleHandler';

/**
 * Kicks the specified user from the server.
 */
export default {
    name : "ban",
    description : "bans the specified user from the server.",
    permission : Discord.PermissionFlagsBits.BanMembers,
    //TODO : handle this command in dms with an rolling panel to choose the server where to ban the user from
    dm : false,
    options : [
        {
            name : "user",
            description : "the user to ban",
            required : true,
            type : "User"
        },
        {
            name : "reason",
            description : "the reason for the ban",
            type : "String"
        },
        {
            // TODO : autocomplete handling : None, 1mn, 10mn, 30mn, 1h, 2h, 12h, 1d, 2d, 3d, 4d, 5d, 6d, 7d
            name : "delete_message_seconds",
            description : "number of seconds of messages to delete",
            type : "Integer"
        },
        {
            name : "silent",
            description : "if true, then nobody else will ever know",
            type : "Boolean"
        }
    ],

    /**
     * executes the module's command. (see module description)
     * 
     * @param {ClientWithCommands} bot the client used by the bot
     * @param {ChatInputCommandInteraction} interaction the interaction from the user
     * 
     * @returns {Promise<void>}
     */
    async run(bot:ClientWithCommands, interaction:Discord.ChatInputCommandInteraction) : Promise<void> {
        if(!interaction.guild) {
            const ghostMsg = await interaction.followUp("Error thrown while executing /ban !");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"Error thrown while executing /ban : interaction's guild cannot be found !"});
            return;
        }
        const user = interaction.options.getUser("user");
        if(!user) {
            const ghostMsg = await interaction.followUp("Error thrown while executing /ban !");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"Error thrown while executing /ban : The value of option 'user' cannot be fetched"});
            print("Error thrown while executing /ban : The value of option 'user' cannot be fetched", LogLevel.Error, bot, interaction.guild);
            return;
        }
        const member = await interaction.guild.members.fetch(user);
        if(!member.bannable) {
            await interaction.followUp("This user cannot be banned !");
            return;
        }
        let timeMsgDel:number | null | undefined = interaction.options.getInteger("delete_message_seconds");
        if (timeMsgDel === null) {
            timeMsgDel = undefined;
        } else if(timeMsgDel < 0 || timeMsgDel > 604800){
            timeMsgDel = undefined;
            print("The given value for delete_message_seconds option of /ban command was not between 0 and 604800, executing command as if it was not given...", LogLevel.Warn, bot, interaction.guild);
        }
        const reason = (interaction.options.getString("reason") ?? "No reason specified")
        member.ban({reason:"you have been banned for : " + reason + "!", deleteMessageSeconds:timeMsgDel});
        if(interaction.options.get("silent")){
            const ghostMsg = await interaction.followUp("Processing...");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"The user was successfully banned !"});
            return;
        }
        interaction.followUp("The user was successfully banned !");
        const banChannelID = bot.guildHandlers.get(interaction.guild)?.banChannelID;
        if(!banChannelID || banChannelID === "-1") { return; }
        const banChannel = await (interaction.guild.channels.fetch(banChannelID));
        if(!banChannel || !banChannel.isTextBased()) { print("Unable to send ban message : The ban channel is not existing or not text-based", LogLevel.Warn, bot, interaction.guild); return; }
        const banEmbed = new Discord.EmbedBuilder()
            .setTitle(member.user.globalName + (member.nickname ? " (" + member.nickname + ")" : "") + " was banned")
            .setDescription("__reason :__\r\n" + reason)
            .setThumbnail(member.avatar ? member.avatarURL() : member.user.avatarURL())
            .setColor(0x9d0101)
            .setFooter({text:"The ban hammer has spoken !", iconURL:"https://ih1.redbubble.net/image.5091230169.2298/pp,504x498-pad,600x600,f8f8f8.u2.jpg"})
        banChannel.send({content:"", embeds:[banEmbed]});
    }

} as ICommand;