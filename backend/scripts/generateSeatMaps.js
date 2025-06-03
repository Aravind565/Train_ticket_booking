  const mongoose = require('mongoose');
  const Train = require('../models/Train');    // adjust path as per your structure
  const SeatMap = require('../models/SeatMap'); // your SeatMap schema model

  // Connect to your MongoDB
  mongoose.connect('mongodb://localhost:27017/train_booking', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('MongoDB connected');
    main();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

  async function main() {
    try {
      const trains = await Train.find();
      const startDate = new Date('2025-05-17');
      const endDate = new Date('2025-05-31');

      for (const train of trains) {
    for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
      const dateStr = dt.toISOString().slice(0, 10);
      const dayOfWeek = dt.toLocaleDateString('en-US', { weekday: 'short' }); // 'Mon', 'Tue', etc.

      // Skip if the train does not run on this day
      if (!train.runningDays.includes(dayOfWeek)) {
        console.log(`Train ${train.trainNumber} does not run on ${dayOfWeek} (${dateStr})`);
        continue;
      }

      const exists = await SeatMap.findOne({ trainNumber: train.trainNumber, date: dateStr });
      if (exists) {
        console.log(`SeatMap already exists for train ${train.trainNumber} on ${dateStr}`);
        continue;
      }

      const coaches = generateCoachesAndSeats(train);
      
      await SeatMap.create({
        trainNumber: train.trainNumber,
        date: dateStr,
        coaches: coaches,
      });

      console.log(`Created SeatMap for train ${train.trainNumber} on ${dateStr}`);
    }
  }


      console.log('Seat map generation complete');
      mongoose.disconnect();
    } catch (err) {
      console.error(err);
      mongoose.disconnect();
    }
  }

  function generateCoachesAndSeats(train) {
    const coaches = [];

    const prefs2S_CC = ['Window', 'Middle', 'Aisle'];
    const prefsSL = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
    const prefs3A_2A = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];

    const seatsPerCoachMap = {
      '2S': 90,
      'CC': 72,
      'SL': 72,
      '3A': 64,
      '2A': 46,
    };

    // Custom seat count for specific trains
    const customSeatConfig = {
      '11111': { '2S': 4, 'CC': 2 },
      // '54321': { '2S': 60 }, // Add more if needed
    };

    const coachPrefixMap = {
      'CC': 'C',
      '2S': 'D',
      'SL': 'S',
      '3A': 'B',
      '2A': 'A',
    };

    train.coachDetails.forEach(detail => {
      const classType = detail.coachType;
      const count = detail.coachCount;
const seatCount = customSeatConfig[train.trainNumber]?.[classType] || seatsPerCoachMap[classType];


      const prefix = coachPrefixMap[classType] || 'X';

      for (let c = 1; c <= count; c++) {
        const coachNumber = prefix + c;
        const seats = [];

        for (let s = 1; s <= seatCount; s++) {
          let preference = 'Unknown';
          if (classType === '2S' || classType === 'CC') {
            preference = prefs2S_CC[(s - 1) % prefs2S_CC.length];
          } else if (classType === 'SL') {
            preference = prefsSL[(s - 1) % prefsSL.length];
          } else if (classType === '3A' || classType === '2A') {
            preference = prefs3A_2A[(s - 1) % prefs3A_2A.length];
          }

          seats.push({
            seatNumber: s.toString(),
            preference,
            isBooked: false,
          });
        }

        coaches.push({
          coachNumber,
          classType,
          seats,
        });
      }
    });

    return coaches;
  }  