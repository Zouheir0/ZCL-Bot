const { QuickDB } = require("quick.db");
const db = new QuickDB();
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "coinflipduo",
  description: "Challenge another user to a coin flip",
  async execute(message, args) {
    const challenger = message.author;
    const opponent = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!opponent || opponent.bot || opponent.id === challenger.id) {
      const embed = new EmbedBuilder()
        .setTitle("Invalid User")
        .setDescription("Please mention a valid user to challenge.")
        .setColor("Red");
      return message.reply({ embeds: [embed] });
    }

    if (isNaN(amount) || amount <= 0) {
      const embed = new EmbedBuilder()
        .setTitle("Invalid Amount")
        .setDescription("Enter a valid amount to gamble.")
        .setColor("Red");
      return message.reply({ embeds: [embed] });
    }

    const challengerKey = `${message.guild.id}_${challenger.id}`;
    const opponentKey = `${message.guild.id}_${opponent.id}`;

    const challengerCredits = (await db.get(`credits_${challengerKey}`)) || 0;
    const opponentCredits = (await db.get(`credits_${opponentKey}`)) || 0;

    if (challengerCredits < amount) {
      const embed = new EmbedBuilder()
        .setTitle("Not Enough Credits")
        .setDescription("You don't have enough credits.")
        .setColor("Red");
      return message.reply({ embeds: [embed] });
    }

    if (opponentCredits < amount) {
      const embed = new EmbedBuilder()
        .setTitle("Opponent Lacks Credits")
        .setDescription(`${opponent.username} doesn't have enough credits.`)
        .setColor("Red");
      return message.reply({ embeds: [embed] });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("accept_coinflip")
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("decline_coinflip")
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger)
    );

    const embed = new EmbedBuilder()
      .setTitle("Coin Flip Challenge")
      .setDescription(`${opponent}, you have been challenged to a coin flip for **${amount}** credits. Do you accept?`)
      .setColor("Yellow");

    const sent = await message.channel.send({ embeds: [embed], components: [row] });

    const filter = (i) =>
      i.user.id === opponent.id && ["accept_coinflip", "decline_coinflip"].includes(i.customId);

    const collector = sent.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async (interaction) => {
      if (interaction.customId === "decline_coinflip") {
        const declineEmbed = new EmbedBuilder()
          .setTitle("Challenge Declined")
          .setDescription(`${opponent.username} declined the challenge.`)
          .setColor("Red");
        await interaction.update({ embeds: [declineEmbed], components: [] });
        return;
      }

      const winner = Math.random() < 0.5 ? challenger : opponent;
      const loser = winner.id === challenger.id ? opponent : challenger;

      await db.sub(`credits_${challengerKey}`, amount);
      await db.sub(`credits_${opponentKey}`, amount);
      await db.add(`credits_${message.guild.id}_${winner.id}`, amount * 2);

      const resultEmbed = new EmbedBuilder()
        .setTitle("Coin Flipped!")
        .setDescription(`**${winner.username}** won **${amount * 2}** credits.`)
        .setColor("Green");

      await interaction.update({ embeds: [resultEmbed], components: [] });
    });

    collector.on("end", async (collected) => {
      if (collected.size === 0) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle("Challenge Timed Out")
          .setDescription("No response received.")
          .setColor("Orange");
        await sent.edit({ embeds: [timeoutEmbed], components: [] });
      }
    });
  }
};