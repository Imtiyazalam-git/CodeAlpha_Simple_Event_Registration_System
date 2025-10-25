const express = require('express');
const router = express.Router();
const Registration = require('../models/Registration');
const { auth } = require('../middleware/authMiddleware');

router.post('/', auth, async (req, res) => {
  const registration = new Registration({
    userName: req.user.id,
    eventId: req.body.eventId,
    userEmail: req.body.userEmail
  });
  await registration.save();
  res.json({ message: 'Registered successfully' });
});

router.get('/', auth, async (req, res) => {
  const registrations = await Registration.find().populate('eventId');
  res.json(registrations);
});

module.exports = router;