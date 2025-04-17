const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const { QuickDB } = require('quick.db');
const fs = require('fs');
const path = require('path');

// Client Setup
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

// Collections
client.commands = new Collection();
client.slashCommands = new Collection();
client.events = new Collection();

// QuickDB Setup
client.db = new QuickDB();

// Prefix (You can also load this from QuickDB or a config)
client.prefix = '.';

// Command Handler (prefix + slash)
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
  const command = require(`./commands/${file}`);
  if (command.data) {
    // Slash command
    client.slashCommands.set(command.data.name, command);
  } else {
    // Prefix command
    client.commands.set(command.name, command);
  }
});

// Event Handler
const eventsPath = path.join(__dirname, 'events');
fs.readdirSync(eventsPath).forEach(file => {
  const event = require(`./events/${file}`);
  if (event && event.name && typeof event.execute === 'function') {
    client.events.set(event.name, event);
    client.on(event.name, (...args) => event.execute(...args, client));
  }
});

// Slash command interaction listener
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.slashCommands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Something went wrong while executing this command.', ephemeral: true });
  }
});

// Bot Login
client.login('MTM1ODQ3OTM0MTgyNjA4NTAxNQ.GEyrwA.sbB3pW9FpeM5v2YxaGlze6epTkkmbY__MoM9mE');
const express = require('express');
const app = express();
const dashboardRoutes = require('./routes/dashboard');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/dashboard', dashboardRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Dashboard running on http://localhost:${PORT}`));