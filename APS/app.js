const express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');


const app = express();
const port = 80;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

mongoose.connect('mongodb://localhost:27017/pollutiondb', {
  useNewUrlParser: true, useUnifiedTopology: true,
});

const Pollution = mongoose.model('Pollution', {
  city: String,
  temperature: Number,
  humidity: Number,
  wind_speed: Number,
  aqi: Number,
  date: Date,
});

app.get('/a', async (req, res) => {
  const data = await Pollution.find().sort({ date: -1 }).limit(30);
  res.render('pollution', { data });
});

app.post('/add', async (req, res) => {
  const newRecord = new Pollution(req.body);
  await newRecord.save();
  res.send({ success: true });
});

app.post('/predict', async (req, res) => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/predict', req.body);
    res.send(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).send('AI Prediction Failed');
  }
});
// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/search', (req, res) => {
    res.render('search');
});

app.get('/world', (req, res) => {
    res.render('world');
});

// API route to fetch weather data
app.get('/weather', async (req, res) => {
  const { city, lat, lon } = req.query;
  const apiKey = "1e3e8f230b6064d27976e41163a82b77";
  let url;

  if (city) {
    url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${city}&appid=${apiKey}`;
  } else if (lat && lon) {
    const geoUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const [geoData] = await geoResponse.json();
    url = `https://api.openweathermap.org/data/2.5/forecast?units=metric&q=${geoData.name}&appid=${apiKey}`;
  } else {
    return res.status(400).json({ error: 'City or coordinates are required' });
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});