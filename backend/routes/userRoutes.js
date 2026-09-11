const express = require('express');
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
  createAuthority,
} = require('../controllers/userController');

const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

router.post(
  '/authority',
  verifyToken,
  authorizeRoles('admin'),
  createAuthority
);

router.get(
  '/',
  verifyToken,
  authorizeRoles('admin'),
  getAllUsers
);

router.get(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  getUserById
);

router.delete(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  deleteUser
);

router.put(
  '/:id',
  verifyToken,
  authorizeRoles('admin'),
  updateUser
);

module.exports = router;