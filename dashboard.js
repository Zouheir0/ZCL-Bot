<<<<<<< HEAD:dashboard.js
const express = require('express');
const router = express.Router();
const { QuickDB } = require('quick.db');
const db = new QuickDB();

router.get('/:guildId', async (req, res) => {
  const guildId = req.params.guildId;
  const settings = await db.get(`settings_${guildId}`) || {
    multiplier: 1,
    creditsPerMsg: 10,
    levelRewards: '',
    crates: {}
  };

  res.render('dashboard', { guildId, settings });
});

router.post('/:guildId', async (req, res) => {
  const guildId = req.params.guildId;
  const { multiplier, creditsPerMsg, levelRewards, crateData } = req.body;

  const crates = JSON.parse(crateData || '{}');

  await db.set(`settings_${guildId}`, {
    multiplier: parseFloat(multiplier),
    creditsPerMsg: parseInt(creditsPerMsg),
    levelRewards,
    crates
  });

  res.redirect(`/dashboard/${guildId}`);
});

=======
const express = require('express');
const router = express.Router();
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const checkAuth = require('../auth/checkAuth'); // Auth middleware

// GET /dashboard/:guildID
router.get('/:guildID', checkAuth, async (req, res) => {
  const guildID = req.params.guildID;
  const guild = req.user.guilds.find(g => g.id === guildID && (g.permissions & 0x8)); // Admin only

  if (!guild) return res.redirect('/dashboard');

  const crates = await db.get(`crates_${guildID}`) || [];

  res.render('dashboard-settings', {
    guild,
    crates
  });
});

// POST /dashboard/:guildID/update
router.post('/:guildID/update', checkAuth, async (req, res) => {
  const guildID = req.params.guildID;
  const form = req.body.crates;

  let formattedCrates = [];

  for (let key in form) {
    const crate = form[key];
    if (!crate.name) continue;

    const items = [];

    for (let itemKey in crate.items) {
      const item = crate.items[itemKey];
      if (!item.name || !item.chance) continue;

      items.push({
        name: item.name,
        chance: parseFloat(item.chance)
      });
    }

    formattedCrates.push({
      name: crate.name,
      rarity: parseFloat(crate.rarity),
      items
    });
  }

  await db.set(`crates_${guildID}`, formattedCrates);
  res.redirect(`/dashboard/${guildID}`);
});

>>>>>>> 693a26c (E):routes/dashboard.js
module.exports = router;