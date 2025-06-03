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
    enum: ['2S', 'CC', 'SL', '3A', '2A'],
    required: true
  },
  fareAmount: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('Fare', fareSchema);
