const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { EmbedBuilder } = require("discord.js");
const { prefix } = require("../config.json");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    // Ignore bots and DMs
    if (message.author.bot || !message.guild) return;

    // Prefix command handling
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName)
      || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    try {
      await command.execute(client, message, args);

      // LOGGING
      const logChannelId = await db.get(`logchannel_${message.guild.id}`);
      if (logChannelId) {
        const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
        if (logChannel && logChannel.isTextBased()) {
          const logEmbed = new EmbedBuilder()
            .setColor("Blue")
            .setTitle("Command Executed")
            .addFields(
              { name: "User", value: `${message.author.tag} (${message.author.id})`, inline: false },
              { name: "Command", value: message.content, inline: false },
              { name: "Channel", value: `<#${message.channel.id}>`, inline: false }
            )
            .setTimestamp();

          logChannel.send({ embeds: [logEmbed] }).catch(() => {});
        }
      }

    } catch (error) {
      console.error(`[ERROR IN ${commandName}]:`, error);
      await message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("❌ Command Error")
            .setDescription("An unexpected error occurred while running this command.")
        ]
      });

      // Also log the error to the log channel
      const logChannelId = await db.get(`logchannel_${message.guild.id}`);
      if (logChannelId) {
        const logChannel = await client.channels.fetch(logChannelId).catch(() => null);
        if (logChannel && logChannel.isTextBased()) {
          const errorEmbed = new EmbedBuilder()
            .setColor("Red")
            .setTitle("Command Error")
            .addFields(
              { name: "User", value: `${message.author.tag} (${message.author.id})`, inline: false },
              { name: "Command", value: message.content, inline: false },
              { name: "Error", value: `\`\`\`${error.message}\`\`\``, inline: false }
            )
            .setTimestamp();

          logChannel.send({ embeds: [errorEmbed] }).catch(() => {});
        }
      }
    }
  }
};