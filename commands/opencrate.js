const { EmbedBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: "opencrate",
  description: "Open a crate",
  async execute(message, args) {
    const crateName = args[0]?.toLowerCase();
    const user = message.author;
    const guildId = message.guild.id;

    if (!crateName) return message.reply("Specify a crate to open!");

    const count = await db.get(`crate_${guildId}_${user.id}_${crateName}`) || 0;
    if (count < 1) return message.reply("You don't have this crate.");

    const settings = await db.get(`settings_${guildId}`);
    const crateData = settings?.crates?.[crateName];

    if (!crateData || crateData.items.length === 0) return message.reply("This crate is empty or not found.");

    const roll = Math.random();
    let selected;
    let totalWeight = 0;

    crateData.items.forEach(item => {
      totalWeight += item.rarity;
    });

    let random = Math.random() * totalWeight;
    for (const item of crateData.items) {
      if (random < item.rarity) {
        selected = item.name;
        break;
      }
      random -= item.rarity;
    }

    await db.sub(`crate_${guildId}_${user.id}_${crateName}`, 1);
    await db.push(`items_${guildId}_${user.id}`, selected);

    const embed = new EmbedBuilder()
      .setTitle('Crate Opened!')
      .setDescription(`You opened a **${crateName}** crate and received **${selected}**!`)
      .setColor('LuminousVividPink');

    message.reply({ embeds: [embed] });
  }
};