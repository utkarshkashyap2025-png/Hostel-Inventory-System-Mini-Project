const express = require('express');

const {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.post('/', createNotification);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;