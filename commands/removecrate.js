const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removecrate')
    .setDescription('Remove crate(s) from a user')
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addStringOption(opt => opt.setName('crate').setDescription('Crate name').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to remove').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const crate = interaction.options.getString('crate').toLowerCase();
    const amount = interaction.options.getInteger('amount');

    let crates = await db.get(`inv_${user.id}.crates`) || {};
    crates[crate] = Math.max(0, (crates[crate] || 0) - amount);
    await db.set(`inv_${user.id}.crates`, crates);

    const embed = new EmbedBuilder()
      .setTitle("🗑️ Crate Removed")
      .setDescription(`Removed **${amount}x ${crate}** crate(s) from ${user}.`)
      .setColor("Red")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};