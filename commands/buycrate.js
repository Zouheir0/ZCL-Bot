const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: "buycrate",
  description: "Buy a crate",
  async execute(message, args) {
    const crateName = args[0]?.toLowerCase();
    const guildId = message.guild.id;
    const user = message.author;

    if (!crateName) return message.reply("Specify a crate name.");

    const settings = await db.get(`settings_${guildId}`);
    const crate = settings?.crates?.[crateName];

    if (!crate) return message.reply("Crate not found.");
    const price = crate.price || 100;

    const userCredits = await db.get(`credits_${guildId}_${user.id}`) || 0;
    if (userCredits < price) return message.reply("Not enough credits.");

    await db.sub(`credits_${guildId}_${user.id}`, price);
    await db.add(`crate_${guildId}_${user.id}_${crateName}`, 1);

    const embed = new EmbedBuilder()
      .setTitle('Crate Purchased!')
      .setDescription(`You bought a **${crateName}** crate for **${price}** credits!`)
      .setColor('Gold');

    message.reply({ embeds: [embed] });
  }
};