// routes/stationRoutes.js
const express = require('express');
const router = express.Router();
const Station = require('../models/Station');

router.get('/', async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bulk insert multiple stations
router.post('/', async (req, res) => {
  try {
    // Expect req.body to be an array of station objects
    if (!Array.isArray(req.body)) {
      return res.status(400).json({ message: 'Expected an array of stations' });
    }

    const savedStations = await Station.insertMany(req.body);
    res.status(201).json(savedStations);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
