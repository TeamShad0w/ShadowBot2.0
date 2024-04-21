import Discord, { ChatInputCommandInteraction, Interaction, messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand from '../utils/command';
import print, { LogLevel } from '../utils/consoleHandler';

/**
 * Kicks the specified user from the server.
 */
export default {
    name : "kick",
    description : "kicks the specified user from the server.",
    permission : Discord.PermissionFlagsBits.KickMembers,
    //TODO : handle this command in dms with an rolling panel to choose the server where to kick the user from
    dm : false,
    options : [
        {
            name : "user",
            description : "the user to kick",
            required : true,
            type : "User"
        },
        {
            name : "reason",
            description : "the reason for the kick",
            type : "String"
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
            const ghostMsg = await interaction.followUp("Error thrown while executing /kick !");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"Error thrown while executing /kick : interaction's guild cannot be found !"});
            return;
        }
        const user = interaction.options.getUser("user");
        if(!user) {
            const ghostMsg = await interaction.followUp("Error thrown while executing /kick !");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"Error thrown while executing /kick : The value of option 'user' cannot be fetched"});
            print("Error thrown while executing /kick : The value of option 'user' cannot be fetched", LogLevel.Error, bot, interaction.guild);
            return;
        }
        const member = await interaction.guild.members.fetch(user);
        if(!member.kickable) {
            await interaction.followUp("This user cannot be kicked !");
            return;
        }
        const reason = (interaction.options.getString("reason") ?? "No reason specified")
        member.kick("you have been kicked for : " + reason + "!");
        if(interaction.options.get("silent")){
            const ghostMsg = await interaction.followUp("Processing...");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"The user was successfully kicked !"});
            return;
        }
        interaction.followUp("The user was successfully kicked !");
        const kickChannelID = bot.guildHandlers.get(interaction.guild)?.kickChannelID;
        if(!kickChannelID || kickChannelID === "-1") { return; }
        const KickChannel = await (interaction.guild.channels.fetch(kickChannelID));
        if(!KickChannel || !KickChannel.isTextBased()) { print("Unable to send kick message : The kick channel is not existing or not text-based", LogLevel.Warn, bot, interaction.guild); return; }
        const kickEmbed = new Discord.EmbedBuilder()
            .setTitle(member.user.globalName + (member.nickname ? " (" + member.nickname + ")" : "") + " was kicked out of the server")
            .setDescription("__reason :__\r\n" + reason)
            .setThumbnail(member.avatar ? member.avatarURL() : member.user.avatarURL())
            .setColor(0x00FFFF)
        KickChannel.send({content:"", embeds:[kickEmbed]});
    }

} as ICommand;