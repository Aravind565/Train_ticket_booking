require('dotenv').config({ path: '../.env' }); // relative path from scripts folder
console.log("MONGO_URI:", process.env.MONGO_URI);
const fs = require('fs');
const mongoose = require('mongoose');
const Fare = require('../models/Fare');
const path = require('path');

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    main();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

async function seedData() {
  try {
    const data = fs.readFileSync(path.join(__dirname, 'fares.json'), 'utf-8');
    const fareData = JSON.parse(data);

    // Group fares by trainNumber
    const faresByTrain = {};
    fareData.forEach(fare => {
      if (!faresByTrain[fare.trainNumber]) {
        faresByTrain[fare.trainNumber] = [];
      }
      faresByTrain[fare.trainNumber].push(fare);
    });

    // Process each train's fares
    let insertedCount = 0;
    let updatedCount = 0;

    for (const [trainNumber, fares] of Object.entries(faresByTrain)) {
      // Delete existing fares for this train (if any)
      const deleteResult = await Fare.deleteMany({ trainNumber });
      
      // Insert all new fares for this train
      const insertResult = await Fare.insertMany(fares);

      if (deleteResult.deletedCount > 0) {
        updatedCount++;
        console.log(`Replaced ${deleteResult.deletedCount} fares for train ${trainNumber}`);
      } else {
        insertedCount++;
        console.log(`Added ${insertResult.length} fares for new train ${trainNumber}`);
      }
    }

    console.log(`\nSeeding completed:
      - New trains added: ${insertedCount}
      - Existing trains updated: ${updatedCount}
      - Total fares processed: ${fareData.length}`);

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedData();