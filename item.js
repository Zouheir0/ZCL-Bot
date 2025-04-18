const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rarity: { type: Number, required: true, min: 1, max: 100 }
});

module.exports = mongoose.model('Item', itemSchema);