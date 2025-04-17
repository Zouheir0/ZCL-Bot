const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guessword')
        .setDescription('Start a guess the word game')
        .addStringOption(opt =>
            opt.setName('words')
                .setDescription('Comma-separated words (e.g. apple,banana,car)')
                .setRequired(true)),

    async execute(interaction) {
        const words = interaction.options.getString('words').split(',').map(w => w.trim().toLowerCase());
        const picked = words[Math.floor(Math.random() * words.length)];

        const embed = new EmbedBuilder()
            .setTitle('Guess the Word!')
            .setDescription('Type your guesses in this channel. First to get it right wins!')
            .setColor('Blue');

        await interaction.reply({ embeds: [embed] });

        const filter = m => !m.author.bot;
        const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

        collector.on('collect', m => {
            if (m.content.toLowerCase() === picked) {
                collector.stop(m.author);
            }
        });

        collector.on('end', (collected, winner) => {
            if (winner instanceof require('discord.js').User) {
                interaction.channel.send({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`${winner} guessed the word **${picked}**!`)] });
            } else {
                interaction.channel.send({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`Time's up! The correct word was **${picked}**.`)] });
            }
        });
    }
};