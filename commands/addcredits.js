const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addcredits')
    .setDescription('Add credits to a user')
    .addUserOption(opt => opt.setName('user').setDescription('Target user').setRequired(true))
    .addIntegerOption(opt => opt.setName('amount').setDescription('Amount to add').setRequired(true)),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('amount');

    let current = await db.get(`credits_${user.id}`) || 0;
    await db.set(`credits_${user.id}`, current + amount);

    const embed = new EmbedBuilder()
      .setTitle("💰 Credits Added")
      .setDescription(`Gave **${amount}** credits to ${user}.`)
      .setColor("Green")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};