// require('dotenv').config({ path: '../.env' }); // relative path from scripts folder
// console.log("MONGO_URI:", process.env.MONGO_URI);

//   const mongoose = require('mongoose');
//   const Train = require('../models/Train');    // adjust path as per your structure
//   const SeatMap = require('../models/SeatMap'); // your SeatMap schema model

//   // Connect to your MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log('MongoDB connected');
//     main();
//   })
//   .catch(err => {
//     console.error('MongoDB connection error:', err);
//   });

//   async function main() {
//     try {
//       const trains = await Train.find();
//       const startDate = new Date('2025-09-05');
//       const endDate = new Date('2025-12-31');

//       for (const train of trains) {
//     for (let dt = new Date(startDate); dt <= endDate; dt.setDate(dt.getDate() + 1)) {
//       const dateStr = dt.toISOString().slice(0, 10);
//       const dayOfWeek = dt.toLocaleDateString('en-US', { weekday: 'short' }); // 'Mon', 'Tue', etc.

//       // Skip if the train does not run on this day
//       if (!train.runningDays.includes(dayOfWeek)) {
//         console.log(`Train ${train.trainNumber} does not run on ${dayOfWeek} (${dateStr})`);
//         continue;
//       }

//       const exists = await SeatMap.findOne({ trainNumber: train.trainNumber, date: dateStr });
//       if (exists) {
//         console.log(`SeatMap already exists for train ${train.trainNumber} on ${dateStr}`);
//         continue;
//       }

//       const coaches = generateCoachesAndSeats(train);
      
//       await SeatMap.create({
//         trainNumber: train.trainNumber,
//         date: dateStr,
//         coaches: coaches,
//       });

//       console.log(`Created SeatMap for train ${train.trainNumber} on ${dateStr}`);
//     }
//   }


//       console.log('Seat map generation complete');
//       mongoose.disconnect();
//     } catch (err) {
//       console.error(err);
//       mongoose.disconnect();
//     }
//   }

//   function generateCoachesAndSeats(train) {
//     const coaches = [];

//     const prefs2S_CC = ['Window', 'Middle', 'Aisle'];
//     const prefsSL = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
//     const prefs3A_2A = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];

//     const seatsPerCoachMap = {
//       '2S': 90,
//       'CC': 72,
//       'SL': 72,
//       '3A': 64,
//       '2A': 46,
//     };

//     // Custom seat count for specific trains
//     const customSeatConfig = {
//       '11111': { '2S': 4, 'CC': 2 },
//       // '54321': { '2S': 60 }, // Add more if needed
//     };

//     const coachPrefixMap = {
//       'CC': 'C',
//       '2S': 'D',
//       'SL': 'S',
//       '3A': 'B',
//       '2A': 'A',
//     };

//     train.coachDetails.forEach(detail => {
//       const classType = detail.coachType;
//       const count = detail.coachCount;
// const seatCount = customSeatConfig[train.trainNumber]?.[classType] || seatsPerCoachMap[classType];


//       const prefix = coachPrefixMap[classType] || 'X';

//       for (let c = 1; c <= count; c++) {
//         const coachNumber = prefix + c;
//         const seats = [];

//         for (let s = 1; s <= seatCount; s++) {
//           let preference = 'Unknown';
//           if (classType === '2S' || classType === 'CC') {
//             preference = prefs2S_CC[(s - 1) % prefs2S_CC.length];
//           } else if (classType === 'SL') {
//             preference = prefsSL[(s - 1) % prefsSL.length];
//           } else if (classType === '3A' || classType === '2A') {
//             preference = prefs3A_2A[(s - 1) % prefs3A_2A.length];
//           }

//           seats.push({
//             seatNumber: s.toString(),
//             preference,
//             isBooked: false,
//           });
//         }

//         coaches.push({
//           coachNumber,
//           classType,
//           seats,
//         });
//       }
//     });

//     return coaches;
//   }  

require('dotenv').config({ path: '../.env' }); // relative path from scripts folder
console.log("MONGO_URI:", process.env.MONGO_URI);

const mongoose = require('mongoose');
const Train = require('../models/Train');    // adjust path as per your structure
const SeatMap = require('../models/SeatMap'); // your SeatMap schema model

// Connect to your MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    main();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

  async function clearExistingSeatMapsForTrain16160() {
  console.log('🗑️  Clearing existing SeatMaps for train 16160...');
  const result = await SeatMap.deleteMany({ trainNumber: 16160 }); // ✅ Only train 16160
  console.log(`✅ Deleted ${result.deletedCount} existing documents for train 16160`);
}

async function main() {
  try {
    await clearExistingSeatMapsForTrain16160();
    const trains = await Train.find();
    const startDate = new Date('2025-09-05');
    const endDate = new Date('2025-12-31');

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

  // Correct seat preferences for different classes
  const prefs1A = ['Lower', 'Upper']; // 1A: 2-berth cabins
  const prefs2A = ['Lower', 'Upper', 'Lower', 'Upper', 'Side Lower', 'Side Upper']; // 2A: NO middle berths
  const prefs3A = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Middle', 'Side Upper']; // 3A: 3-tier
  const prefs3E = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Middle', 'Side Upper']; // 3E: 9 berths per bay
  const prefsSL = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Middle', 'Side Upper']; // SL: Same as 3A
  const prefsCC = ['Window', 'Aisle', 'Window', 'Aisle']; // CC: 2+2 seating
  const prefsEC = ['Window', 'Aisle']; // EC: 2+2 executive seating
  const prefs2S = ['Window', 'Middle', 'Aisle', 'Window', 'Aisle']; // 2S: 3+2 seating
  const prefsFC = ['Lower', 'Middle', 'Upper', 'Lower', 'Middle', 'Upper', 'Side Lower', 'Side Middle', 'Side Upper']; // FC: Same as SL but non-AC

  // Standard seat/berth counts per coach
  const seatsPerCoachMap = {
    // Seating Classes
    '2S': 108,      // Second Sitting
    'CC': 78,       // Chair Car (ICF: 73, LHB: 78)
    'EC': 46,       // Executive Chair Car

    // Sleeping Classes
    'SL': 72,       // Sleeper Class (ICF: 72, LHB: 81)
    '3A': 64,       // Third AC (ICF: 64, LHB: 72)
    '3E': 83,       // AC 3 Tier Economy (9 berths per bay)
    '2A': 46,       // Second AC (ICF: 46, LHB: 54) - NO middle berths
    '1A': 18,       // First AC (2-berth cabins)
    'FC': 72,       // First Class Non-AC (same as SL)

    // Composite Classes
    'HA': 30,       // AC First Class cum AC 2-tier (10 First AC + 20 2A)
  };

  // Custom seat count for specific trains
  const customSeatConfig = {
    '11111': { '2S': 4, 'CC': 2 },
    // Add more custom configurations as needed
  };

  // Coach prefix mapping
  const coachPrefixMap = {
    '1A': 'HA',     // First AC
    '2A': 'A',      // Second AC
    '3A': 'B',      // Third AC
    '3E': 'B',      // AC 3 Tier Economy
    'SL': 'S',      // Sleeper
    'CC': 'C',      // Chair Car
    'EC': 'E',      // Executive Chair Car
    '2S': 'D',      // Second Sitting
    'FC': 'F',      // First Class
    'HA': 'H',      // Composite First AC + 2A
  };

  train.coachDetails.forEach(detail => {
    const classType = detail.coachType;
    const count = detail.coachCount;
    const seatCount = customSeatConfig[train.trainNumber]?.[classType] || seatsPerCoachMap[classType];

    if (!seatCount) {
      console.warn(`Unknown class type: ${classType} for train ${train.trainNumber}`);
      return;
    }

    const prefix = coachPrefixMap[classType] || 'X';

    for (let c = 1; c <= count; c++) {
      const coachNumber = prefix + c;
      const seats = [];

      // Generate seats based on class type with correct preferences
      for (let s = 1; s <= seatCount; s++) {
        let preference = 'Unknown';

        switch (classType) {
          case '1A':
            preference = prefs1A[(s - 1) % prefs1A.length];
            break;
          case '2A':
            // 2A has NO middle berths - only Lower, Upper, Side Lower, Side Upper
            preference = prefs2A[(s - 1) % prefs2A.length];
            break;
          case '3A':
            preference = prefs3A[(s - 1) % prefs3A.length];
            break;
          case '3E':
            preference = prefs3E[(s - 1) % prefs3E.length];
            break;
          case 'SL':
            preference = prefsSL[(s - 1) % prefsSL.length];
            break;
          case 'CC':
            preference = prefsCC[(s - 1) % prefsCC.length];
            break;
          case 'EC':
            preference = prefsEC[(s - 1) % prefsEC.length];
            break;
          case '2S':
            preference = prefs2S[(s - 1) % prefs2S.length];
            break;
          case 'FC':
            preference = prefsFC[(s - 1) % prefsFC.length];
            break;
          case 'HA':
            // Composite coach: first 10 are 1A style, next 20 are 2A style
            if (s <= 10) {
              preference = prefs1A[(s - 1) % prefs1A.length];
            } else {
              preference = prefs2A[(s - 11) % prefs2A.length];
            }
            break;
          default:
            preference = 'General';
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