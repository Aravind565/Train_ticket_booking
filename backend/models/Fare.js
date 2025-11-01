const mongoose = require('mongoose');

const fareSchema = new mongoose.Schema({
  trainNumber: {
    type: Number,
    required: true
  },
  from: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  },
 classType: {
    type: String,
    enum: ['1A', '2A', '3A', '3E', 'SL', 'CC', 'EC', '2S', 'FC', 'HA'], // extended classes
    required: true
  },
  fareAmount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Fare', fareSchema);
