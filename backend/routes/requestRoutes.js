const express = require('express');

const {
  createRequest,
  getAllRequests,
  approveRequest,
  rejectRequest,
} = require('../controllers/requestController');

const router = express.Router();

router.post('/', createRequest);
router.get('/', getAllRequests);
router.put('/:id/approve', approveRequest);
router.put('/:id/reject', rejectRequest);

module.exports = router;