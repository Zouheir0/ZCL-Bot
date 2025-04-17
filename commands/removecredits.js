const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removecredits')
    .setDescription('Remove credits from a user')
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to remove').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    let current = await db.get(`credits_${user.id}`) || 0;
    let newAmount = Math.max(0, current - amount);
    await db.set(`credits_${user.id}`, newAmount);

    const embed = new EmbedBuilder()
      .setTitle("❌ Credits Removed")
      .setDescription(`Removed **${amount}** credits from ${user}.`)
      .setColor("Red")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};