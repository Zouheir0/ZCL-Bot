const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addcrate')
    .setDescription('Add a crate to a user')
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(opt => opt.setName('crate').setDescription('Crate name').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to add').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const crate = interaction.options.getString('crate').toLowerCase();
    const amount = interaction.options.getInteger('amount');

    let crates = await db.get(`inv_${user.id}.crates`) || {};
    crates[crate] = (crates[crate] || 0) + amount;
    await db.set(`inv_${user.id}.crates`, crates);

    const embed = new EmbedBuilder()
      .setTitle("📦 Crate Given")
      .setDescription(`Gave **${amount}x ${crate}** crate(s) to ${user}.`)
      .setColor("Orange")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};