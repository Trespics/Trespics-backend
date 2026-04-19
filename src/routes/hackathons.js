const express = require('express');
const router = express.Router();
const { getAllHackathons, getHackathonById, createHackathon } = require('../controllers/hackathonsController');

router.get('/', getAllHackathons);
router.get('/:id', getHackathonById);
router.post('/', createHackathon);

module.exports = router;
