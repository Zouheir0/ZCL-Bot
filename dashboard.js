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

module.exports = router;