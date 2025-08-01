const mongoose = require('mongoose');
const Pollution = require('./models/Pollution');  // This must exist

mongoose.connect('mongodb://localhost:27017/pollutiondb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const sampleData = [
  { country: 'Pakistan', city: 'Lahore', temperature: 36, humidity: 45, wind_speed: 6, aqi: 160 },
  { country: 'Pakistan', city: 'Karachi', temperature: 33, humidity: 65, wind_speed: 5, aqi: 120 },
  { country: 'India', city: 'Delhi', temperature: 39, humidity: 42, wind_speed: 4, aqi: 190 },
  { country: 'USA', city: 'New York', temperature: 29, humidity: 70, wind_speed: 7, aqi: 90 },
  { country: 'China', city: 'Beijing', temperature: 35, humidity: 55, wind_speed: 3, aqi: 200 },
  { country: 'UK', city: 'London', temperature: 25, humidity: 75, wind_speed: 6, aqi: 80 },
  { country: 'Germany', city: 'Berlin', temperature: 28, humidity: 68, wind_speed: 5, aqi: 70 },
  { country: 'Japan', city: 'Tokyo', temperature: 31, humidity: 60, wind_speed: 4, aqi: 100 }
];

Pollution.insertMany(sampleData)
  .then(() => {
    console.log("✅ Sample pollution data inserted into MongoDB.");
    mongoose.connection.close();
  })
  .catch(err => {
    console.error("❌ Failed to insert data:", err);
    mongoose.connection.close();
  });
