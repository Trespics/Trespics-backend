const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogsController');
const authenticateToken = require('../middleware/auth');

// =============================================
// PUBLIC ROUTES
// =============================================

// Get blog analytics (admin) — must be before /:slug to avoid conflict
router.get('/analytics/dashboard', authenticateToken, blogsController.getBlogAnalytics);

// Get all blogs for admin (including drafts, unapproved)
router.get('/admin/all', authenticateToken, blogsController.getAllBlogsAdmin);

// Get ALL comments for admin moderation
router.get('/admin/comments', authenticateToken, blogsController.getAllCommentsAdmin);

// Get featured blogs
router.get('/featured', blogsController.getFeaturedBlogs);

// Get all categories
router.get('/categories', blogsController.getCategories);

// Get all published blogs (with pagination, search, filter)
router.get('/', blogsController.getAllBlogs);

// Get single blog by slug
router.get('/:slug', blogsController.getBlogBySlug);

// =============================================
// AUTHENTICATED USER ROUTES
// =============================================

// Create a new blog
router.post('/', blogsController.createBlog);

// Like/unlike a blog
router.post('/:id/like', blogsController.toggleLike);

// Save/unsave a blog
router.post('/:id/save', blogsController.toggleSave);

// Get comments for a blog
router.get('/:id/comments', blogsController.getComments);

// Add a comment
router.post('/:id/comment', blogsController.addComment);

// Reply to a comment
router.post('/:id/reply', blogsController.addReply);

// =============================================
// ADMIN ROUTES (require auth token)
// =============================================

// Update a blog
router.put('/:id', authenticateToken, blogsController.updateBlog);

// Delete a blog
router.delete('/:id', authenticateToken, blogsController.deleteBlog);

// Approve a blog
router.put('/:id/approve', authenticateToken, blogsController.approveBlog);

// Toggle featured status
router.put('/:id/feature', authenticateToken, blogsController.toggleFeatured);

// Delete a comment (moderation)
router.delete('/comments/:id', authenticateToken, blogsController.deleteComment);

module.exports = router;
