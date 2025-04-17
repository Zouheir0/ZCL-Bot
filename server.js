const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const quickdb = require('quick.db');
const app = express();
const port = 3000;

// Initialize Discord.js client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.login('MTM1ODQ3OTM0MTgyNjA4NTAxNQ.GEyrwA.sbB3pW9FpeM5v2YxaGlze6epTkkmbY__MoM9mE'); // Your bot token goes here

app.use(express.json());
app.use(express.static('public')); // Serve static frontend files (HTML, CSS, JS)

// Initialize Quick.db
const db = new quickdb.table('guildSettings');

// API endpoint to get current server settings
app.get('/api/guild-settings', async (req, res) => {
  const { guildId } = req.query;
  if (!guildId) return res.status(400).json({ error: 'Missing guild ID' });

  const settings = await db.get(`settings_${guildId}`) || {
    levelMultiplier: 1,
    creditsPerMessage: 5,
    cratePrice: 100,
    rewardOnLevel: 'Mystery Box', // Example reward
  };

  res.json(settings);
});

// API endpoint to save updated server settings
app.post('/api/save-settings', async (req, res) => {
  const { guildId, levelMultiplier, creditsPerMessage, cratePrice, rewardOnLevel } = req.body;

  if (!guildId) return res.status(400).json({ error: 'Missing guild ID' });

  // Save settings to Quick.db
  await db.set(`settings_${guildId}`, { levelMultiplier, creditsPerMessage, cratePrice, rewardOnLevel });

  res.status(200).json({ message: 'Settings saved successfully!' });
});

// Start Express server
app.listen(port, () => {
  console.log(`Dashboard server is running at http://localhost:${port}`);
});

// Log in Discord bot
client.once('ready', () => {
  console.log('Bot is logged in and ready!');
});