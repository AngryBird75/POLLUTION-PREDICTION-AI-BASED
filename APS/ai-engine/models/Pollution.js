const mongoose = require('mongoose');

const pollutionSchema = new mongoose.Schema({
  country: String,
  city: String,
  temperature: Number,
  humidity: Number,
  wind_speed: Number,
  aqi: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('records', pollutionSchema);
