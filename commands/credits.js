const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: "credits",
  description: "Check your credit balance",
  async execute(message) {
    const user = message.author;
    const guildId = message.guild.id;

    const credits = await db.get(`credits_${guildId}_${user.id}`) || 0;

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Credits`)
      .setDescription(`You have **${credits}** credits.`)
      .setColor('Gold')
      .setFooter({ text: 'Credits System' });

    message.reply({ embeds: [embed] });
  }
};