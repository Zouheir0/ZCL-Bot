const { EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  name: 'robloxai',
  description: 'Generate a Roblox game idea using AI!',
  async execute(message, args) {
    if (!args || args.length === 0) {
      return message.channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('Missing Game Idea!')
            .setDescription('Please provide a game idea. Example:\n`.robloxai anime fighting simulator`')
            .setColor('Red')
            .setFooter({ text: 'ZouheirGPT AI System' })
        ]
      });
    }

    const idea = args.join(' ');

    const thinking = await message.channel.send({
      embeds: [
        new EmbedBuilder()
          .setTitle('Thinking...')
          .setDescription('The AI is creating your Roblox hit game idea. Please wait...')
          .setColor('Blue')
          .setFooter({ text: 'Generating with Hugging Face AI' })
      ]
    });

    try {
      const response = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer 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',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `Create a full Roblox game design idea based on: "${idea}"\nInclude:\n- Core Gameplay Loop\n- Unique Mechanics\n- Player Progression\n- Monetization\n- Replayability\n- Premium Features\nUse emojis and fun formatting.`,
        }),
      });

      const data = await response.json();
      const output = data?.[0]?.generated_text || 'AI failed to respond properly.';

      await thinking.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle(`Your Roblox Game Idea: ${idea}`)
            .setDescription(output.slice(0, 4090)) // Discord max is 4096
            .setColor('Green')
            .setFooter({ text: 'ZouheirGPT AI | Mistral Model' })
        ]
      });

    } catch (err) {
      console.error(err);
      await thinking.edit({
        embeds: [
          new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Failed to get a response from the AI.')
            .setColor('Red')
          ]
      });
    }
  }
};