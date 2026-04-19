const express = require('express');
const router = express.Router();
const { createTeam, getTeamById } = require('../controllers/teamsController');

router.post('/', createTeam);
router.get('/:id', getTeamById);

module.exports = router;
