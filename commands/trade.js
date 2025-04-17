const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ComponentType } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  name: 'trade',
  description: 'Trade items, crates, or credits with another user.',
  async execute(message, args) {
    const user1 = message.author;
    const user2 = message.mentions.users.first();

    if (!user2 || user2.bot || user1.id === user2.id) {
      return message.reply("Please mention a valid user to trade with.");
    }

    const tradeData = {
      [user1.id]: { credits: 0, crates: {}, items: [], confirmed: false },
      [user2.id]: { credits: 0, crates: {}, items: [], confirmed: false }
    };

    const key1 = `${message.guild.id}_${user1.id}`;
    const key2 = `${message.guild.id}_${user2.id}`;

    const createTradeEmbed = () => {
      return new EmbedBuilder()
        .setTitle("Trade Session")
        .setDescription(`Trading between ${user1.username} and ${user2.username}`)
        .addFields(
          { name: `${user1.username}'s Offer`, value: formatOffer(tradeData[user1.id]), inline: true },
          { name: `${user2.username}'s Offer`, value: formatOffer(tradeData[user2.id]), inline: true }
        )
        .setColor('Blue')
        .setFooter({ text: "Both users must confirm to complete the trade." });
    };

    const formatOffer = (offer) => {
      const crateStr = Object.entries(offer.crates).map(([k, v]) => `${k}: ${v}`).join('\n') || "None";
      const itemStr = offer.items.join(', ') || "None";
      const creditStr = offer.credits > 0 ? `${offer.credits} credits` : "None";
      return `Credits: ${creditStr}\nCrates:\n${crateStr}\nItems: ${itemStr}`;
    };

    const components = (userId) => [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`add_${userId}`).setLabel("Add Offer").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`confirm_${userId}`).setLabel("Confirm").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("cancel").setLabel("Cancel").setStyle(ButtonStyle.Danger)
      )
    ];

    const msg = await message.channel.send({
      content: `${user1} and ${user2}, react below to trade.`,
      embeds: [createTradeEmbed()],
      components: components(user1.id)
    });

    const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 5 * 60_000 });

    collector.on('collect', async interaction => {
      const user = interaction.user;

      if (![user1.id, user2.id].includes(user.id)) return interaction.reply({ content: "You're not part of this trade.", ephemeral: true });

      if (interaction.customId === 'cancel') {
        collector.stop("cancelled");
        return interaction.update({ content: "Trade cancelled.", embeds: [], components: [] });
      }

      if (interaction.customId.startsWith('add_')) {
        const modal = new ModalBuilder()
          .setCustomId(`offer_modal_${user.id}`)
          .setTitle("Add Offer")
          .addComponents(
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("credits").setLabel("Credits").setStyle(TextInputStyle.Short).setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("crates").setLabel("Crates (e.g. common:2)").setStyle(TextInputStyle.Short).setRequired(false)
            ),
            new ActionRowBuilder().addComponents(
              new TextInputBuilder().setCustomId("items").setLabel("Items (comma separated)").setStyle(TextInputStyle.Short).setRequired(false)
            )
          );

        await interaction.showModal(modal);
      }

      if (interaction.customId.startsWith('confirm_')) {
        tradeData[user.id].confirmed = true;
        await interaction.update({ embeds: [createTradeEmbed()], components: components(user1.id) });

        if (tradeData[user1.id].confirmed && tradeData[user2.id].confirmed) {
          const valid = await validateAll(tradeData, key1, key2);
          if (!valid.status) {
            return msg.edit({ content: `Trade failed: ${valid.reason}`, components: [] });
          }

          await applyTrade(tradeData, key1, key2);
          return msg.edit({ content: "Trade completed successfully!", embeds: [], components: [] });
        }
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason !== 'cancelled') {
        msg.edit({ content: "Trade expired.", components: [] });
      }
    });

    message.client.on('interactionCreate', async interaction => {
      if (!interaction.isModalSubmit()) return;
      if (!interaction.customId.startsWith('offer_modal_')) return;

      const user = interaction.user;
      const key = `${message.guild.id}_${user.id}`;

      const credits = parseInt(interaction.fields.getTextInputValue("credits")) || 0;
      const crateInput = interaction.fields.getTextInputValue("crates");
      const itemInput = interaction.fields.getTextInputValue("items");

      const crates = {};
      if (crateInput) {
        const parts = crateInput.split(',').map(x => x.trim().toLowerCase());
        for (const part of parts) {
          const [name, count] = part.split(':');
          if (!name || isNaN(count)) return interaction.reply({ content: "Invalid crate input.", ephemeral: true });
          crates[name.toLowerCase()] = parseInt(count);
        }
      }

      const items = itemInput ? itemInput.split(',').map(x => x.trim().toLowerCase()) : [];

      const invCredits = await db.get(`credits_${key}`) || 0;
      const invCrates = await db.get(`boxes_${key}`) || {};
      const invItems = await db.get(`items_${key}`) || {};

      if (credits > invCredits) return interaction.reply({ content: "You don't have enough credits.", ephemeral: true });

      for (const [name, amount] of Object.entries(crates)) {
        if ((invCrates[name] || 0) < amount) return interaction.reply({ content: `You don't have enough ${name} crates.`, ephemeral: true });
      }

      for (const item of items) {
        if (!invItems[item] || invItems[item] <= 0) return interaction.reply({ content: `You don't have the item: ${item}`, ephemeral: true });
      }

      tradeData[user.id].credits = credits;
      tradeData[user.id].crates = crates;
      tradeData[user.id].items = items;
      tradeData[user.id].confirmed = false;

      await interaction.reply({ content: "Offer updated!", ephemeral: true });
      await msg.edit({ embeds: [createTradeEmbed()], components: components(user1.id) });
    });
  }
};

async function validateAll(data, key1, key2) {
  const keys = [key1, key2];
  const users = Object.keys(data);

  for (let i = 0; i < 2; i++) {
    const k = keys[i];
    const d = data[users[i]];

    const invCredits = await db.get(`credits_${k}`) || 0;
    const invCrates = await db.get(`boxes_${k}`) || {};
    const invItems = await db.get(`items_${k}`) || {};

    if (d.credits > invCredits) return { status: false, reason: "One user doesn't have enough credits." };

    for (const [name, count] of Object.entries(d.crates)) {
      if ((invCrates[name] || 0) < count) return { status: false, reason: `Not enough crates: ${name}` };
    }

    for (const item of d.items) {
      if (!invItems[item] || invItems[item] <= 0) return { status: false, reason: `Missing item: ${item}` };
    }
  }

  return { status: true };
}

async function applyTrade(data, key1, key2) {
  const users = Object.keys(data);
  const offer1 = data[users[0]];
  const offer2 = data[users[1]];

  const inv1 = {
    credits: await db.get(`credits_${key1}`) || 0,
    crates: await db.get(`boxes_${key1}`) || {},
    items: await db.get(`items_${key1}`) || {}
  };

  const inv2 = {
    credits: await db.get(`credits_${key2}`) || 0,
    crates: await db.get(`boxes_${key2}`) || {},
    items: await db.get(`items_${key2}`) || {}
  };

  inv1.credits -= offer1.credits;
  inv2.credits -= offer2.credits;

  inv1.credits += offer2.credits;
  inv2.credits += offer1.credits;

  for (const [crate, count] of Object.entries(offer1.crates)) {
    inv1.crates[crate] = (inv1.crates[crate] || 0) - count;
    inv2.crates[crate] = (inv2.crates[crate] || 0) + count;
  }

  for (const [crate, count] of Object.entries(offer2.crates)) {
    inv2.crates[crate] = (inv2.crates[crate] || 0) - count;
    inv1.crates[crate] = (inv1.crates[crate] || 0) + count;
  }

  for (const item of offer1.items) {
    inv1.items[item] = (inv1.items[item] || 0) - 1;
    inv2.items[item] = (inv2.items[item] || 0) + 1;
  }

  for (const item of offer2.items) {
    inv2.items[item] = (inv2.items[item] || 0) - 1;
    inv1.items[item] = (inv1.items[item] || 0) + 1;
  }

  await db.set(`credits_${key1}`, inv1.credits);
  await db.set(`credits_${key2}`, inv2.credits);
  await db.set(`boxes_${key1}`, inv1.crates);
  await db.set(`boxes_${key2}`, inv2.crates);
  await db.set(`items_${key1}`, inv1.items);
  await db.set(`items_${key2}`, inv2.items);
}