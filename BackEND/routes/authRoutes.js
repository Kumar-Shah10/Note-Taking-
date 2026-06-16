const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;