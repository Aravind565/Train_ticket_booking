
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Train = require('../models/Train');

const seatsPerCoachMap = {
  '2S': 90,
  'CC': 72,
  'SL': 72,
  '3A': 64,
  '2A': 46,
};

// Get all trains
router.get('/', async (req, res) => {
  try {
    const trains = await Train.find();
    res.json(trains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search trains by from and to station codes or names
router.get('/search', async (req, res) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing from or to query parameter' });
    }

    const fromLower = from.toLowerCase();
    const toLower = to.toLowerCase();

    const trains = await Train.find({
      route: {
        $elemMatch: {
          $or: [
            { stationCode: { $regex: new RegExp(`^${fromLower}$`, 'i') } },
            { stationName: { $regex: new RegExp(`^${fromLower}$`, 'i') } }
          ]
        }
      }
    });

    const filteredTrains = trains.filter(train => {
      const route = train.route;

      const fromIndex = route.findIndex(st =>
        st.stationCode.toLowerCase() === fromLower ||
        st.stationName.toLowerCase() === fromLower
      );

      const toIndex = route.findIndex(st =>
        st.stationCode.toLowerCase() === toLower ||
        st.stationName.toLowerCase() === toLower
      );

      return fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex;
    });

    const updatedTrains = filteredTrains.map(train => {
      const seatAvailability = {};
      train.classes.forEach(cls => {
        const coachInfo = train.coachDetails.find(c => c.coachType === cls.classType);
        const seatsPerCoach = seatsPerCoachMap[cls.classType] || 30;
        const seats = coachInfo ? coachInfo.coachCount * seatsPerCoach : 0;
        seatAvailability[cls.classType] = seats;
      });

      return {
        ...train._doc,
        seatAvailability
      };
    });

    res.json(updatedTrains);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get train by MongoDB _id
// Get train by MongoDB _id (at /api/trains/:id)
router.get('/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid train ID' });
  }
  try {
    const train = await Train.findById(req.params.id);
    if (!train) {
      return res.status(404).json({ message: "Train not found" });
    }
    res.json(train);
  } catch (error) {
    console.error("Error fetching train by ID:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get train by trainNumber (at /api/trains/number/:trainNumber)
router.get('/number/:trainNumber', async (req, res) => {
  try {
    const train = await Train.findOne({ trainNumber: req.params.trainNumber });
    if (!train) return res.status(404).json({ error: 'Train not found' });
    res.json(train);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new train
router.post('/', async (req, res) => {
  try {
    const newTrain = new Train(req.body);
    const savedTrain = await newTrain.save();
    res.status(201).json(savedTrain);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
