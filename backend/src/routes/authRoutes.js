const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const { register, login, forgotPassword, resetPassword, getMe } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getMe);

module.exports = router;