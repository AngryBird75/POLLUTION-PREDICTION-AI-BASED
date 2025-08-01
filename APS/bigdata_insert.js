// bigdata_insert.js
const mongoose = require('mongoose');
const fs = require('fs');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/pollutionnDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define Schema
const Pollution = mongoose.model('Pollution', {
  city: String,
  country: String,
  temperature: Number,
  humidity: Number,
  wind_speed: Number,
  aqi: Number,
  date: Date,
});

// Load Data
const data = JSON.parse(fs.readFileSync('./data.json', 'utf-8'));

// Insert Data
Pollution.insertMany(data)
  .then(() => {
    console.log('✅ Big Data inserted successfully!');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('❌ Error inserting data:', err);
    mongoose.disconnect();
  });
