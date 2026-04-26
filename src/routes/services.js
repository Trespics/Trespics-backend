const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/servicesController');
const authenticateToken = require('../middleware/auth');

// Get all services
router.get('/', servicesController.getAllServices);

// Create a service (Admin only)
router.post('/', authenticateToken, servicesController.createService);

// Update a service (Admin only)
router.put('/:id', authenticateToken, servicesController.updateService);

// Delete a service (Admin only)
router.delete('/:id', authenticateToken, servicesController.deleteService);

module.exports = router;
