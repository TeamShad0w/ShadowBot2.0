import Discord, { ChatInputCommandInteraction, Guild, Interaction, messageLink, Options } from 'discord.js';
import ClientWithCommands from '../utils/clientWithCommands';
import ICommand from '../utils/command';
import print, { LogLevel } from '../utils/consoleHandler';

/**
 * Unbans the specified user from the server.
 */
export default {
    name : "unban",
    description : "unbans the specified user from the server.",
    permission : Discord.PermissionFlagsBits.BanMembers,
    //TODO : handle this command in dms with an rolling panel to choose the server where to ban the user from
    dm : false,
    options : [

        {
            name : "user",
            description : "the user to unban",
            required : true,
            type : "User"
        },

        {
            name : "reason",
            description : "the reason for the unban",
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
            const ghostMsg = await interaction.followUp("Error thrown while executing /unban !");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"Error thrown while executing /unban : interaction's guild cannot be found !"});
            return;
        }

        const user = interaction.options.getUser("user");

        if(!user) {
            const ghostMsg = await interaction.followUp("Error thrown while executing /unban !");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"Error thrown while executing /unban : The value of option 'user' cannot be fetched"});
            print("Error thrown while executing /unban : The value of option 'user' cannot be fetched", LogLevel.Error, bot, interaction.guild);
            return;
        }
        let bans = await interaction.guild.bans.fetch();
        const reason = (interaction.options.getString("reason") ?? "No reason specified");
        if(bans.has(user.id) === false) {
            if(interaction.options.get("silent")){
                const ghostMsg = await interaction.followUp("Processing...");
                await ghostMsg.delete();
                await interaction.followUp({ephemeral:true, content:"The user wasn't banned !"});
                return;
            }
            await interaction.followUp("The user wasn't banned !");
            return;
        }
        interaction.guild.members.unban(user.id);
        if(interaction.options.get("silent")){
            const ghostMsg = await interaction.followUp("Processing...");
            await ghostMsg.delete();
            await interaction.followUp({ephemeral:true, content:"The user was successfully unbanned !"});
            return;
        }
        
        await interaction.followUp("The user was successfully unbanned !");
        const banChannelID = bot.guildHandlers.get(interaction.guild)?.banChannelID;

        if(!banChannelID || banChannelID === "-1") { return; }
        const banChannel = await (interaction.guild.channels.fetch(banChannelID));
        if(!banChannel || !banChannel.isTextBased()) { print("Unable to send ban message : The ban channel is not existing or not text-based", LogLevel.Warn, bot, interaction.guild); return; }
        const banEmbed = new Discord.EmbedBuilder()
            .setTitle(user.globalName + " was unbanned")
            .setDescription("__reason :__\r\n" + reason)
            .setThumbnail(user.avatar ? user.avatarURL() : user.avatarURL())
            .setColor(0x17a057)
            .setFooter({text:"The gate has been oppened again for " + user.globalName +" !", iconURL:"https://as2.ftcdn.net/v2/jpg/02/82/55/95/1000_F_282559572_HiD9UMwkb9JZvIF6E7dOzfi3B0Coe92m.jpg"})
        banChannel.send({content:"", embeds:[banEmbed]});
    }

} as ICommand;