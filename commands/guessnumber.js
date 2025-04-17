const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guessnumber',
  description: 'Guess the Number game with embeds and animations',
  async execute(interaction, client) {
    const player = interaction.user;
    const numberToGuess = Math.floor(Math.random() * 1000) + 1; // Generate random number between 1 and 1000
    let attempts = 0;
    const maxAttempts = 10;

    // Initial message and embed setup
    const startEmbed = new EmbedBuilder()
      .setTitle('Guess the Number Game!')
      .setDescription(`Hey ${player.username}, welcome to **Guess the Number**!\nI have picked a number between 1 and 1000.\nYou have ${maxAttempts} attempts to guess it.`)
      .setColor(0x3498db)
      .setTimestamp();

    await interaction.reply({ embeds: [startEmbed] });

    // Collector for player guesses
    const filter = (msg) => msg.author.id === player.id;
    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

    collector.on('collect', async (message) => {
      attempts++;

      const userGuess = parseInt(message.content);
      
      if (isNaN(userGuess)) {
        return message.reply('Please enter a valid number!');
      }

      let responseMessage = '';
      if (userGuess > numberToGuess) {
        responseMessage = `Too high! Try a lower number. You have **${maxAttempts - attempts}** attempts left.`;
      } else if (userGuess < numberToGuess) {
        responseMessage = `Too low! Try a higher number. You have **${maxAttempts - attempts}** attempts left.`;
      } else {
        responseMessage = `Congratulations ${player.username}, you guessed the number **${numberToGuess}** correctly in **${attempts}** attempts!`;
        collector.stop();
      }

      // Update Embed dynamically
      const guessEmbed = new EmbedBuilder()
        .setTitle('Guess the Number - Guess Again!')
        .setDescription(responseMessage)
        .setColor(0x3498db)
        .setTimestamp();

      await message.reply({ embeds: [guessEmbed] });

      // End game if max attempts reached
      if (attempts >= maxAttempts && userGuess !== numberToGuess) {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('Game Over')
          .setDescription(`Sorry ${player.username}, you’ve run out of attempts! The number was **${numberToGuess}**.`)
          .setColor(0xe74c3c)
          .setTimestamp();

        collector.stop();
        await message.reply({ embeds: [timeoutEmbed] });
      }
    });

    collector.on('end', async (collected, reason) => {
      if (reason === 'time') {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle('Game Over')
          .setDescription(`Time is up, ${player.username}! The correct number was **${numberToGuess}**.`)
          .setColor(0xe74c3c)
          .setTimestamp();
        await interaction.followUp({ embeds: [timeoutEmbed] });
      }
    });
  },
};