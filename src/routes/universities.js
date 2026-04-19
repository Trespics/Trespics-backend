const express = require('express');
const router = express.Router();
const { 
  getAllUniversities, 
  searchUniversities, 
  createUniversity, 
  updateUniversity, 
  deleteUniversity 
} = require('../controllers/universitiesController');

router.get('/', getAllUniversities);
router.get('/search', searchUniversities);
router.post('/', createUniversity);
router.put('/:id', updateUniversity);
router.delete('/:id', deleteUniversity);

module.exports = router;
