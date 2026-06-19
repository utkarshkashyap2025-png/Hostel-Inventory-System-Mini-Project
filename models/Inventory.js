const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  unit: { type: String, required: true },
  lowStockLimit: { type: Number, default: 10 },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);