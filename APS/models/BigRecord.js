
const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  date: String,
  country: String,
  city: String,
  temperature: Number,
  humidity: Number,
  wind_speed: Number,
  predicted_pollution: Number
}, { collection: 'records' });

module.exports = mongoose.model('BigRecord', recordSchema);
