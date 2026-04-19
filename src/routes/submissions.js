const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissionById, getHackathonSubmissions } = require('../controllers/submissionsController');

router.post('/', createSubmission);
router.get('/:id', getSubmissionById);
router.get('/hackathon/:id', getHackathonSubmissions);

module.exports = router;
