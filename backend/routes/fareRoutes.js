const express = require('express');
const router = express.Router();
const Fare = require('../models/Fare');

// Get fare by trainNumber, from, to, and classType
router.get('/', async (req, res) => {
  const { trainNumber, from, to, classType } = req.query;
  if (!trainNumber || !from || !to || !classType) {
    return res.status(400).json({ error: 'trainNumber, from, to, and classType query parameters required' });
  }

  try {
    const fare = await Fare.findOne({ trainNumber, from, to, classType });
    if (!fare) return res.status(404).json({ error: 'Fare not found' });
    res.json(fare);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/insert', async (req, res) => {
  const fares = req.body;

if (!Array.isArray(fares)) {
  return res.status(400).json({ error: 'Request body must be an array' });
}

const insertedFares = await Fare.insertMany(fares);


  try {
    const insertedFares = await Fare.insertMany(fares);
    res.status(201).json({ message: 'Fares inserted successfully', count: insertedFares.length });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Failed to insert fares' });
  }
});

router.post('/bulk', async (req, res) => {
  const { queries } = req.body;

  if (!Array.isArray(queries)) {
    return res.status(400).json({ error: 'Invalid request format' });
  }

  try {
    const conditions = queries.map(q => ({
      trainNumber: q.trainNumber,
      from: q.from,
      to: q.to,
      classType: q.classType
    }));

    const fares = await Fare.find({ $or: conditions });

    // Build response map
    const fareMap = {};
    fares.forEach(f => {
      const key = `${f.trainNumber}_${f.classType}_${f.from}_${f.to}`;
      fareMap[key] = f.fareAmount;
    });

    res.json(fareMap);
  } catch (err) {
    console.error('Error fetching bulk fares:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
