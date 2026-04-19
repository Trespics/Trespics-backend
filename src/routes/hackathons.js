const express = require('express');
const router = express.Router();
const { 
  getAllHackathons, 
  getHackathonById, 
  createHackathon, 
  updateHackathon, 
  deleteHackathon,
  registerForHackathon,
  checkRegistrationStatus,
  getHackathonRegistrations
} = require('../controllers/hackathonsController');

router.get('/', getAllHackathons);
router.get('/:id', getHackathonById);
router.get('/:id/registration-status', checkRegistrationStatus);
router.get('/:id/registrations', getHackathonRegistrations);
router.post('/', createHackathon);
router.post('/:id/register', registerForHackathon);
router.put('/:id', updateHackathon);
router.delete('/:id', deleteHackathon);

module.exports = router;
