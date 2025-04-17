const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dashboard')
    .setDescription('Open your server configuration dashboard'),

  async execute(interaction, client) {
    const isAdmin = interaction.member.permissions.has('Administrator');
    if (!isAdmin) {
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('Access Denied')
            .setDescription('Only server admins can use this command.')
            .setColor('Red')
        ],
        ephemeral: true
      });
    }

    const serverId = interaction.guild.id;
    const serverName = interaction.guild.name;
    const dashUrl = `https://yourdomain.com/dashboard/${serverId}`;

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Server Dashboard')
          .setDescription(`[Click here to open your dashboard](${dashUrl})`)
          .addFields(
            { name: 'Server', value: serverName, inline: true },
            { name: 'Admin', value: interaction.user.tag, inline: true }
          )
          .setColor('Green')
          .setFooter({ text: 'Dashboard opens in your browser' })
      ],
      ephemeral: true
    });
  }
};