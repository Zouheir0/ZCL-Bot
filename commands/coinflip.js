const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "coinflip",
  description: "Gamble credits by flipping a coin (vs bot)",
  async execute(message, args) {
    const userId = `${message.guild.id}_${message.author.id}`;
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setTitle("Invalid Amount")
        .setDescription("Please enter a valid amount to gamble.")
        .setColor("Red");
      return message.reply({ embeds: [embed] });
    }

    const userCredits = (await db.get(`credits_${userId}`)) || 0;
    if (userCredits < amount) {
      const embed = new EmbedBuilder()
        .setTitle("Not Enough Credits")
        .setDescription("You don't have enough credits to gamble that amount.")
        .setColor("Red");
      return message.reply({ embeds: [embed] });
    }

    const result = Math.random() < 0.5 ? "win" : "lose";
    const embed = new EmbedBuilder().setColor(result === "win" ? "Green" : "Red");

    if (result === "win") {
      await db.add(`credits_${userId}`, amount);
      embed.setTitle("You Won!").setDescription(`You gained **${amount}** credits.`);
    } else {
      await db.sub(`credits_${userId}`, amount);
      embed.setTitle("You Lost").setDescription(`You lost **${amount}** credits.`);
    }

    return message.reply({ embeds: [embed] });
  }
};