const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: "inventory",
  description: "View your crates and items",
  async execute(message) {
    const user = message.author;
    const guildId = message.guild.id;

    const crates = await db.all();
    const crateEntries = crates.filter(e => e.id.startsWith(`crate_${guildId}_${user.id}_`));
    const items = await db.get(`items_${guildId}_${user.id}`) || [];

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s Inventory`)
      .setColor('Purple');

    if (crateEntries.length > 0) {
      embed.addFields({
        name: 'Crates',
        value: crateEntries.map(e => `**${e.id.split('_').pop()}**: ${e.value}`).join('\n')
      });
    }

    if (items.length > 0) {
      embed.addFields({
        name: 'Items',
        value: items.map(i => `- ${i}`).join('\n')
      });
    }

    if (crateEntries.length === 0 && items.length === 0) {
      embed.setDescription('You have nothing in your inventory.');
    }

    message.reply({ embeds: [embed] });
  }
};