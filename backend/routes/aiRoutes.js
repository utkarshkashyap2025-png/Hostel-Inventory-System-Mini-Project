const express = require('express');
const router = express.Router();

const Inventory = require('../models/Inventory');
const Transaction = require('../models/Transaction');
const chatbotService = require('../services/chatbotService');

const { GoogleGenerativeAI } = require("@google/generative-ai");

console.log("Gemini Key =", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Gemini Key =", process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash"
});

router.get('/predict-stock', async (req, res) => {
  try {
    const items = await Inventory.find();

    const predictions = [];

    for (const item of items) {

      const outTransactions = await Transaction.find({
        inventoryId: item._id,
        type: 'OUT'
      });

      const totalUsed = outTransactions.reduce(
        (sum, tx) => sum + tx.quantity,
        0
      );

      const avgUsage =
        outTransactions.length > 0
          ? totalUsed / outTransactions.length
          : 0;

      const remainingCycles =
        avgUsage > 0
          ? (item.quantity / avgUsage).toFixed(2)
          : 'No Usage Data';

      predictions.push({
        item: item.name,
        currentStock: item.quantity,
        averageUsage: avgUsage,
        estimatedRemainingCycles: remainingCycles
      });
    }

    res.json(predictions);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

router.get('/low-stock', async (req, res) => {
  try {
    const Inventory = require('../models/Inventory');

    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$lowStockLimit'] }
    });

    res.json({
      count: lowStockItems.length,
      items: lowStockItems
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/restock-recommendation', async (req, res) => {
  try {
    const Inventory = require('../models/Inventory');
    const Transaction = require('../models/Transaction');

    const items = await Inventory.find();

    const recommendations = [];

    for (const item of items) {

      const transactions = await Transaction.find({
        inventoryId: item._id,
        type: 'OUT'
      });

      const totalUsed = transactions.reduce(
        (sum, t) => sum + t.quantity,
        0
      );

      const avgUsage =
        transactions.length > 0
          ? totalUsed / transactions.length
          : 0;

      const recommendedOrder =
        Math.ceil(avgUsage * 10);

      recommendations.push({
        item: item.name,
        currentStock: item.quantity,
        averageUsage: avgUsage,
        recommendedOrder
      });
    }

    res.json(recommendations);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/insights', async (req, res) => {
  try {
    const Inventory = require('../models/Inventory');
    const Transaction = require('../models/Transaction');

    const items = await Inventory.find();
    const insights = [];

    for (const item of items) {

      const transactions = await Transaction.find({
        inventoryId: item._id,
        type: 'OUT'
      });

      const totalUsed = transactions.reduce(
        (sum, t) => sum + t.quantity,
        0
      );

      const avgUsage =
        transactions.length > 0
          ? totalUsed / transactions.length
          : 0;

      const daysLeft =
        avgUsage > 0
          ? (item.quantity / avgUsage).toFixed(1)
          : "Infinity";

      if (
        avgUsage > 0 &&
        item.quantity <= item.lowStockLimit
      ) {
        insights.push({
          item: item.name,
          severity: "HIGH",
          message: `${item.name} stock is low. May run out in ${daysLeft} days`
        });
      }
    }

    res.json(insights);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

// POST /api/ai/chat - Custom Local Node-NLP Hostel Chatbot
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        reply: "Please send a valid message text.",
        intent: 'invalid_input'
      });
    }

    const response = await chatbotService.processMessage(message);
    res.json(response);
  } catch (err) {
    console.error('Chatbot Processing Error:', err);
    res.status(500).json({
      reply: "Sorry, I encountered an internal error while looking up that information. Please try again.",
      error: err.message
    });
  }
});

module.exports = router;        