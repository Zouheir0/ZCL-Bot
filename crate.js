const mongoose = require('mongoose');
const Item = require('./Item');

const crateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rarity: { type: Number, required: true },
  items: [Item.schema]
});

module.exports = mongoose.model('Crate', crateSchema);