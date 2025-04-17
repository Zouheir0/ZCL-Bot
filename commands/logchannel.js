const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: "logchannel",
  description: "Set the channel where command logs will be sent.",
  aliases: [],
  usage: "[channel mention or ID]",
  cooldown: 5,

  async execute(message, args, client) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("Permission Denied")
            .setDescription("You need to be an administrator to set the log channel.")
        ]
      });
    }

    let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

    if (!channel) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setTitle("Invalid Channel")
            .setDescription("Please mention a valid channel or provide a correct channel ID.")
        ]
      });
    }

    await db.set(`logChannel_${message.guild.id}`, channel.id);

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor("Green")
          .setTitle("Log Channel Set")
          .setDescription(`All command logs will now be sent to ${channel}.`)
      ]
    });
  }
};