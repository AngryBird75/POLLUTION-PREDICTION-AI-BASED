const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  city: String,
  temperature: Number,
  humidity: Number,
  wind_speed: Number,
  aqi: Number,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', predictionSchema);
 