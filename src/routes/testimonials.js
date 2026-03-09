const express = require('express');
const router = express.Router();
const testimonialsController = require('../controllers/testimonialsController');
const authenticateToken = require('../middleware/auth');

// Get all testimonials
router.get('/', testimonialsController.getAllTestimonials);

// Create a testimonial (Admin only)
router.post('/', authenticateToken, testimonialsController.createTestimonial);

// Update a testimonial (Admin only)
router.put('/:id', authenticateToken, testimonialsController.updateTestimonial);

// Delete a testimonial (Admin only)
router.delete('/:id', authenticateToken, testimonialsController.deleteTestimonial);

module.exports = router;
