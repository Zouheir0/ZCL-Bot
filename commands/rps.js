const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'rps',
  description: 'Challenge another user to a Rock Paper Scissors duel!',
  
  async execute(message, args) {
    // Ensure message is valid and not an interaction
    if (!message || !message.channel || !message.reply) return;

    const challenger = message.author;
    const opponent = message.mentions?.users?.first();

    // Ensure the opponent is valid
    if (!opponent || opponent.bot || opponent.id === challenger.id) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('Invalid opponent')
            .setDescription('You must mention a valid user to challenge (no bots or yourself).')
            .setTimestamp()
        ]
      });
    }

    const challengeEmbed = new EmbedBuilder()
      .setColor('Blurple')
      .setTitle('Rock Paper Scissors Challenge!')
      .setDescription(`**${challenger.username}** has challenged **${opponent.username}** to a duel!\n\n**${opponent.username}**, do you accept?`)
      .setFooter({ text: 'RPS Challenge' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('accept_rps')
        .setLabel('Accept')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('decline_rps')
        .setLabel('Decline')
        .setStyle(ButtonStyle.Danger)
    );

    // Send challenge message to the channel
    const challengeMsg = await message.channel.send({ embeds: [challengeEmbed], components: [row] });

    // Create filter for message collector
    const filter = (interaction) => interaction.user.id === opponent.id;
    const collector = challengeMsg.createMessageComponentCollector({ filter, time: 15000 });

    collector.on('collect', async (interaction) => {
      if (interaction.customId === 'decline_rps') {
        await interaction.update({
          embeds: [
            new EmbedBuilder()
              .setColor('DarkRed')
              .setDescription(`**${opponent.username}** declined the challenge.`)
          ],
          components: []
        });
        collector.stop();
        return;
      }

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor('Gold')
            .setDescription('Challenge accepted! Preparing the battle arena...')
        ],
        components: []
      });

      setTimeout(async () => {
        const choiceButtons = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId('rock').setLabel('Rock').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('paper').setLabel('Paper').setStyle(ButtonStyle.Secondary),
          new ButtonBuilder().setCustomId('scissors').setLabel('Scissors').setStyle(ButtonStyle.Secondary)
        );

        const gameMsg = await message.channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor('Blue')
              .setTitle('Choose your weapon!')
              .setDescription(`Both players, click a button below to make your choice.`)
              .setTimestamp()
          ],
          components: [choiceButtons]
        });

        const choices = new Map();

        const gameFilter = (i) => i.user.id === challenger.id || i.user.id === opponent.id;
        const gameCollector = gameMsg.createMessageComponentCollector({ filter: gameFilter, time: 20000 });

        gameCollector.on('collect', async (i) => {
          if (choices.has(i.user.id)) {
            return i.reply({ content: 'You already picked!', ephemeral: true });
          }

          choices.set(i.user.id, i.customId);
          await i.reply({ content: `You chose **${i.customId.toUpperCase()}**!`, ephemeral: true });

          if (choices.size === 2) {
            gameCollector.stop();
          }
        });

        gameCollector.on('end', async () => {
          const user1 = challenger;
          const user2 = opponent;

          const choice1 = choices.get(user1.id);
          const choice2 = choices.get(user2.id);

          let resultEmbed;

          if (!choice1 || !choice2) {
            resultEmbed = new EmbedBuilder()
              .setColor('DarkRed')
              .setTitle('Game Canceled')
              .setDescription('One or both players did not make a choice in time.');
          } else {
            const winner = determineWinner(choice1, choice2);

            let resultText = `**${user1.username}** chose **${choice1.toUpperCase()}**\n**${user2.username}** chose **${choice2.toUpperCase()}**\n\n`;

            if (winner === 0) {
              resultText += `It's a **tie**!`;
            } else if (winner === 1) {
              resultText += `**${user1.username}** wins!`;
            } else {
              resultText += `**${user2.username}** wins!`;
            }

            resultEmbed = new EmbedBuilder()
              .setColor('Green')
              .setTitle('Battle Results')
              .setDescription(resultText)
              .setTimestamp();
          }

          await gameMsg.edit({ embeds: [resultEmbed], components: [] });
        });

      }, 3000);
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        challengeMsg.edit({
          embeds: [
            new EmbedBuilder()
              .setColor('Grey')
              .setDescription(`The challenge timed out. No response from **${opponent.username}**.`)
          ],
          components: []
        });
      }
    });

    // Win logic
    function determineWinner(choice1, choice2) {
      if (choice1 === choice2) return 0;
      if (
        (choice1 === 'rock' && choice2 === 'scissors') ||
        (choice1 === 'paper' && choice2 === 'rock') ||
        (choice1 === 'scissors' && choice2 === 'paper')
      ) return 1;
      return 2;
    }
  }
};