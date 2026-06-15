const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');

// Stock IN
router.post('/in', async (req, res) => {
  try {
    const { inventoryId, quantity, note } = req.body;
    const item = await Inventory.findById(inventoryId);
    item.quantity += quantity;
    await item.save();
    const transaction = new Transaction({ inventoryId, type: 'IN', quantity, note });
    await transaction.save();
    res.json({ message: 'Stock added', item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stock OUT
router.post('/out', async (req, res) => {
  try {
    const { inventoryId, quantity, note } = req.body;
    const item = await Inventory.findById(inventoryId);
    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient stock' });
    }
    item.quantity -= quantity;
    await item.save();
    const transaction = new Transaction({ inventoryId, type: 'OUT', quantity, note });
    await transaction.save();
    res.json({ message: 'Stock removed', item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stock History
router.get('/history', async (req, res) => {
  try {
    const history = await Transaction.find().populate('inventoryId', 'name');
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;