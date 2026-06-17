const express = require('express');

const {
  register,
  login,
  profile,
  logout,
} = require('../controllers/authController');

const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', verifyToken, profile);
router.post('/logout', verifyToken, logout);

router.get('/test', verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Protected Route Accessed',
    user: req.user,
  });
});

module.exports = router;