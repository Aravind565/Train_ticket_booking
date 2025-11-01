// const mongoose = require('mongoose');

// const routeSchema = new mongoose.Schema({
//   stationCode: { type: String, trim: true, uppercase: true, required: true },
//   stationName: { type: String, trim: true, required: true },
//   arrivalTime: { type: String, trim: true, default: null },
//   departureTime: { type: String, trim: true, default: null },
//   dayCount: { type: Number, required: true }
// });

// const coachDetailSchema = new mongoose.Schema({
//   coachType: { type: String, required: true, enum: ['2S', 'CC', 'SL', '3A', '2A'] },
//   coachCount: { type: Number, required: true } // e.g., 3 coaches => D1, D2, D3
// });

// const classSchema = new mongoose.Schema({
//   classType: { type: String, trim: true, required: true }, // e.g., "2S", "CC", "SL", etc.
// });

// const trainSchema = new mongoose.Schema({
//   trainNumber: { type: Number, required: true, unique: true },
//   trainName: { type: String, required: true, trim: true },
//   trainType: { type: String, enum: ['DAY', 'NIGHT'], required: true }, // <== NEW
//   from: { type: String, required: true, trim: true, uppercase: true },
//   to: { type: String, required: true, trim: true, uppercase: true },
//   departureTime: { type: String, trim: true, required: true },
//   arrivalTime: { type: String, trim: true, required: true },
//   route: { type: [routeSchema], required: true },
//   classes: { type: [classSchema], required: true }, // just names here
//   coachDetails: { type: [coachDetailSchema], required: true }, // <== NEW
//   runningDays: { type: [String], required: true } // e.g., ["Mon", "Tue"]
// });

// trainSchema.index({ 'route.stationCode': 1 });

// module.exports = mongoose.model('Train', trainSchema);

const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  stationCode: { type: String, trim: true, uppercase: true, required: true },
  stationName: { type: String, trim: true, required: true },
  arrivalTime: { type: String, trim: true, default: null },
  departureTime: { type: String, trim: true, default: null },
  dayCount: { type: Number, required: true }
});

const coachDetailSchema = new mongoose.Schema({
  coachType: { 
    type: String, 
    required: true, 
    enum: ['1A', '2A', '3A', '3E', 'SL', 'CC', 'EC', '2S', 'FC', 'HA'] // Updated with all classes
  },
  coachCount: { type: Number, required: true } // e.g., 3 coaches => D1, D2, D3
});

const classSchema = new mongoose.Schema({
  classType: { 
    type: String, 
    trim: true, 
    required: true,
    enum: ['1A', '2A', '3A', '3E', 'SL', 'CC', 'EC', '2S', 'FC', 'HA'] // Updated with all classes
  }
});

const trainSchema = new mongoose.Schema({
  trainNumber: { type: Number, required: true, unique: true },
  trainName: { type: String, required: true, trim: true },
  trainType: { type: String, enum: ['DAY', 'NIGHT'], required: true },
  from: { type: String, required: true, trim: true, uppercase: true },
  to: { type: String, required: true, trim: true, uppercase: true },
  departureTime: { type: String, trim: true, required: true },
  arrivalTime: { type: String, trim: true, required: true },
  route: { type: [routeSchema], required: true },
  classes: { type: [classSchema], required: true },
  coachDetails: { type: [coachDetailSchema], required: true },
  runningDays: { type: [String], required: true } // e.g., ["Mon", "Tue"]
});

trainSchema.index({ 'route.stationCode': 1 });

module.exports = mongoose.model('Train', trainSchema);
