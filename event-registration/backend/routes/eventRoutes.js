const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const { auth, adminOnly } = require('../middleware/authMiddleware');


router.get('/', async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

router.post('/', auth, adminOnly, async (req, res) => {
  const newEvent = new Event(req.body);
  await newEvent.save();
  res.json({ message: 'Event created', newEvent });
});

module.exports = router;