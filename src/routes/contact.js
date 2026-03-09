const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticateToken = require('../middleware/auth');

// Submit a contact message
router.post('/', contactController.submitContactMessage);

// Get all messages (Admin only)
router.get('/', authenticateToken, contactController.getAllMessages);

module.exports = router;
