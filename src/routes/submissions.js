const express = require('express');
const router = express.Router();
const { createSubmission, getSubmissionById, getHackathonSubmissions, updateSubmissionFeedback } = require('../controllers/submissionsController');

router.post('/', createSubmission);
router.get('/:id', getSubmissionById);
router.get('/hackathon/:id', getHackathonSubmissions);
router.put('/:id/feedback', updateSubmissionFeedback);

module.exports = router;
