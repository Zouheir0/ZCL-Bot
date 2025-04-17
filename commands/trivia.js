const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'trivia',
  description: 'Trivia game with embeds and animations',
  async execute(interaction, client) {
    const player = interaction.user;

    // Trivia questions and answers
    const triviaQuestions = [
      {
        question: 'What is the capital of France?',
        answers: ['Paris', 'London', 'Berlin', 'Madrid'],
        correct: 'Paris',
      },
      {
        question: 'What is the tallest mountain in the world?',
        answers: ['K2', 'Mount Everest', 'Mount Kilimanjaro', 'Mount Fuji'],
        correct: 'Mount Everest',
      },
      // Add more trivia questions here
    ];

    const randomQuestion = triviaQuestions[Math.floor(Math.random() * triviaQuestions.length)];
    const { question, answers, correct } = randomQuestion;

    // Embed for the trivia question
    const triviaEmbed = new EmbedBuilder()
      .setTitle('Trivia Time!')
      .setDescription(`${player.username}, here’s your question: ${question}\nChoose the correct answer below.`)
      .setColor(0x3498db)
      .setTimestamp();

    // Creating buttons for the answers
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('answer1').setLabel(answers[0]).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('answer2').setLabel(answers[1]).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('answer3').setLabel(answers[2]).setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('answer4').setLabel(answers[3]).setStyle(ButtonStyle.Primary),
      );

    await interaction.reply({ embeds: [triviaEmbed], components: [row] });

    // Filter to capture responses
    const filter = (buttonInteraction) => buttonInteraction.user.id === player.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async (buttonInteraction) => {
      const selectedAnswer = buttonInteraction.customId;
      let resultMessage = '';

      if (answers[selectedAnswer.charAt(selectedAnswer.length - 1) - 1] === correct) {
        resultMessage = `Correct! You answered **${correct}**!`;
      } else {
        resultMessage = `Wrong answer! The correct answer was **${correct}**.`;
      }

      // Create the result embed
      const resultEmbed = new EmbedBuilder()
        .setTitle('Trivia Result')
        .setDescription(resultMessage)
        .setColor(0x2ecc71)
        .setTimestamp();

      await buttonInteraction.reply({ embeds: [resultEmbed] });

      // Log the trivia result in the log channel
      const logChannel = await client.channels.fetch(await client.db.get('logChannel'));
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('Trivia Result')
          .addFields(
            { name: 'Player', value: `${player.username} (${player.id})` },
            { name: 'Question', value: question },
            { name: 'Answer', value: resultMessage }
          )
          .setColor(0x9b59b6)
          .setTimestamp();
        logChannel.send({ embeds: [logEmbed] });
      }

      collector.stop();
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('Game Over')
          .setDescription(`Time’s up, ${player.username}! You didn’t answer in time.`)
          .setColor(0xe74c3c)
          .setTimestamp();
        await interaction.followUp({ embeds: [timeoutEmbed] });
      }
    });
  },
};