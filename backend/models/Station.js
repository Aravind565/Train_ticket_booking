const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
  stationCode: { type: String, required: true, unique: true },
  stationName: { type: String, required: true },
});

module.exports = mongoose.model('Station', stationSchema);
