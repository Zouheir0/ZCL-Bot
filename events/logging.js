const { Events, EmbedBuilder } = require("discord.js");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    if (!interaction.guild || interaction.user.bot) return;

    const logChannelId = await db.get(`logchannel_${interaction.guild.id}`);
    if (!logChannelId) return;

    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    if (!logChannel) return;

    if (interaction.isCommand()) {
      const embed = new EmbedBuilder()
        .setTitle("📥 Slash Command Used")
        .setDescription(`**User:** ${interaction.user.tag}\n**Command:** /${interaction.commandName}`)
        .setColor("Blue")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    }

    if (interaction.isModalSubmit()) {
      const embed = new EmbedBuilder()
        .setTitle("📝 Modal Submitted")
        .setDescription(`**User:** ${interaction.user.tag}\n**Modal ID:** ${interaction.customId}`)
        .setColor("Orange")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    }

    if (interaction.isButton()) {
      const embed = new EmbedBuilder()
        .setTitle("🔘 Button Clicked")
        .setDescription(`**User:** ${interaction.user.tag}\n**Button ID:** ${interaction.customId}`)
        .setColor("Purple")
        .setTimestamp();

      logChannel.send({ embeds: [embed] });
    }
  }
};