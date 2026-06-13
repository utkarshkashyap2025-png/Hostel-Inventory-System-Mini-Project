const express = require('express');
const {
  getAllRooms,
  createRoom,
  updateRoom,
  getRoomInventory,
} = require('../controllers/roomController');

const router = express.Router();

router.get('/', getAllRooms);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.get('/:id/inventory', getRoomInventory);

module.exports = router;
