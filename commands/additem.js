const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('additem')
    .setDescription('Add an item to a user')
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(opt => opt.setName('item').setDescription('Item name').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to give').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const item = interaction.options.getString('item').toLowerCase();
    const amount = interaction.options.getInteger('amount');

    let inv = await db.get(`inv_${user.id}.items`) || {};
    inv[item] = (inv[item] || 0) + amount;
    await db.set(`inv_${user.id}.items`, inv);

    const embed = new EmbedBuilder()
      .setTitle("🎁 Item Given")
      .setDescription(`Gave **${amount}x ${item}** to ${user}.`)
      .setColor("Green")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};