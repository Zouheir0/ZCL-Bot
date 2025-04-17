const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: "level",
  description: "Check your level",
  async execute(message) {
    const user = message.author;
    const guildId = message.guild.id;

    const xp = await db.get(`xp_${guildId}_${user.id}`) || 0;
    const level = await db.get(`level_${guildId}_${user.id}`) || 0;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Level`)
      .setDescription(`Level: **${level}**\nXP: **${xp}**`)
      .setColor('Blue')
      .setFooter({ text: 'Level System' });

    message.reply({ embeds: [embed] });
  }
};