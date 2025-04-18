const express = require('express');
const router = express.Router();
const Crate = require('../models/Crate');
const Item = require('../models/Item');

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/login');
}

// GET /dashboard
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const crates = await Crate.find().lean();
    res.render('dashboard', {
      user: req.user,
      crates: crates,
      message: req.query.message || null
    });
  } catch (err) {
    console.error('[Dashboard GET]', err);
    res.status(500).send('Internal Server Error');
  }
});

// POST /add-crate
router.post('/add-crate', isAuthenticated, async (req, res) => {
  const { name, rarity } = req.body;

  if (!name || !rarity) {
    return res.redirect('/dashboard?message=Missing+crate+name+or+rarity');
  }

  try {
    const existing = await Crate.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existing) {
      return res.redirect('/dashboard?message=Crate+already+exists');
    }

    const newCrate = new Crate({
      name: name.trim(),
      rarity: parseInt(rarity),
      items: []
    });

    await newCrate.save();
    res.redirect('/dashboard?message=Crate+added+successfully');
  } catch (err) {
    console.error('[Add Crate]', err);
    res.redirect('/dashboard?message=Failed+to+add+crate');
  }
});

// POST /add-item/:crateId
router.post('/add-item/:crateId', isAuthenticated, async (req, res) => {
  const { crateId } = req.params;
  const { itemName, itemRarity } = req.body;

  if (!itemName || !itemRarity) {
    return res.redirect('/dashboard?message=Missing+item+name+or+rarity');
  }

  try {
    const crate = await Crate.findById(crateId);
    if (!crate) {
      return res.redirect('/dashboard?message=Crate+not+found');
    }

    const item = {
      name: itemName.trim(),
      rarity: parseInt(itemRarity)
    };

    crate.items.push(item);
    await crate.save();

    res.redirect('/dashboard?message=Item+added+to+crate');
  } catch (err) {
    console.error('[Add Item]', err);
    res.redirect('/dashboard?message=Failed+to+add+item');
  }
});

// DELETE crate (optional advanced route)
router.post('/delete-crate/:id', isAuthenticated, async (req, res) => {
  try {
    await Crate.findByIdAndDelete(req.params.id);
    res.redirect('/dashboard?message=Crate+deleted');
  } catch (err) {
    console.error('[Delete Crate]', err);
    res.redirect('/dashboard?message=Error+deleting+crate');
  }
});

// DELETE item from crate (optional advanced route)
router.post('/delete-item/:crateId/:itemIndex', isAuthenticated, async (req, res) => {
  try {
    const { crateId, itemIndex } = req.params;
    const crate = await Crate.findById(crateId);
    if (!crate) return res.redirect('/dashboard?message=Crate+not+found');

    crate.items.splice(itemIndex, 1);
    await crate.save();

    res.redirect('/dashboard?message=Item+removed');
  } catch (err) {
    console.error('[Delete Item]', err);
    res.redirect('/dashboard?message=Failed+to+remove+item');
  }
});

module.exports = router;