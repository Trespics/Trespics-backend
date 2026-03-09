const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Simple admin login
router.post('/login', authController.login);
router.post('/register', authController.register);

module.exports = router;
