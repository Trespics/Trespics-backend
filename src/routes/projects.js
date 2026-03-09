const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const authenticateToken = require('../middleware/auth');

// Get all projects
router.get('/', projectsController.getAllProjects);

// Create a project (Admin only)
router.post('/', authenticateToken, projectsController.createProject);

// Update a project (Admin only)
router.put('/:id', authenticateToken, projectsController.updateProject);

// Delete a project (Admin only)
router.delete('/:id', authenticateToken, projectsController.deleteProject);

module.exports = router;
