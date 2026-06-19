const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

// GET all activity logs
router.get('/', async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('itemId', 'name category')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;