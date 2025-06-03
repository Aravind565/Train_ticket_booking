const express = require('express');
const router = express.Router();
const SeatMap = require('../models/SeatMap');

// Bulk availability endpoint - optimized for your data structure
router.post('/availability/bulk', async (req, res) => {
  try {
    const { trainNumber, dates } = req.body;
    
    if (!trainNumber || !dates || !Array.isArray(dates)) {
      return res.status(400).json({ error: 'trainNumber and dates array are required' });
    }

    // Fetch only necessary fields to optimize response
    const seatMaps = await SeatMap.find(
      { 
        trainNumber: trainNumber,
        date: { $in: dates }
      },
      { 
        'date': 1,
        'coaches.classType': 1,
        'coaches.coachNumber': 1,
        'coaches.seats.isBooked': 1,
        'coaches.seats._id': 1
      }
    ).lean();

    // Transform data to calculate availability per class
    const result = seatMaps.map(seatMap => {
      const availabilityByClass = {};
      
      seatMap.coaches.forEach(coach => {
        if (!availabilityByClass[coach.classType]) {
          availabilityByClass[coach.classType] = {
            available: 0,
            total: coach.seats.length
          };
        }
        
        availabilityByClass[coach.classType].available += 
          coach.seats.filter(seat => !seat.isBooked).length;
      });

      return {
        date: seatMap.date,
        availability: availabilityByClass,
        coaches: seatMap.coaches.map(coach => ({
          coachNumber: coach.coachNumber,
          classType: coach.classType,
          availableSeats: coach.seats.filter(seat => !seat.isBooked).length,
          totalSeats: coach.seats.length
        }))
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET availability for trainNumber and dates via query params
router.get('/availability/bulk', async (req, res) => {
  try {
    const { trainNumber, dates } = req.query;

    if (!trainNumber || !dates) {
      return res.status(400).json({ error: 'trainNumber and dates are required as query parameters' });
    }

    // dates might come as comma-separated string from query params, convert to array
    const datesArray = Array.isArray(dates) ? dates : dates.split(',');

    const seatMaps = await SeatMap.find(
      { 
        trainNumber: trainNumber,
        date: { $in: datesArray }
      },
      { 
        'date': 1,
        'coaches.classType': 1,
        'coaches.coachNumber': 1,
        'coaches.seats.isBooked': 1,
        'coaches.seats._id': 1
      }
    ).lean();

    const result = seatMaps.map(seatMap => {
      const availabilityByClass = {};

     seatMap.coaches.forEach(coach => {
  if (!availabilityByClass[coach.classType]) {
    availabilityByClass[coach.classType] = {
      available: 0,
      total: 0   // start from 0 here
    };
  }
  
  availabilityByClass[coach.classType].available += coach.seats.filter(seat => !seat.isBooked).length;
  availabilityByClass[coach.classType].total += coach.seats.length;  // add total seats cumulatively
});


      return {
        date: seatMap.date,
        availability: availabilityByClass,
        coaches: seatMap.coaches.map(coach => ({
          coachNumber: coach.coachNumber,
          classType: coach.classType,
          availableSeats: coach.seats.filter(seat => !seat.isBooked).length,
          totalSeats: coach.seats.length
        }))
      };
    });

    res.json(result);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;