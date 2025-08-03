require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

const app = express();
const port = 80;

const flash = require('connect-flash');
app.use(flash());

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ⏳ Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'yourSecretKeyHere',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,           // Use true in production with HTTPS
    httpOnly: true,
    maxAge: 10 * 60 * 1000   // 10 minutes
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// MongoDB
mongoose.connect('mongodb://localhost:27017/pollutiondb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('🔌 Mongoose connected'))
  .catch(err => console.error('❌ Mongoose connection error:', err));

// Models
const BigRecord = require('./models/BigRecord');
const User = require('./models/User');

// Pollution schema
const Pollution = mongoose.model('Pollution', new mongoose.Schema({
  city: String,
  temperature: Number,
  humidity: Number,
  wind_speed: Number,
  aqi: Number,
  date: Date
}));

// 🔐 Token generator middleware
function generateToken(req, res, next) {
  if (!req.session.token) {
    req.session.token = crypto.randomBytes(32).toString('hex');
  }
  res.locals.token = req.session.token;
  next();
}

// 🔐 Auth middleware
function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Passport Configs
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          username: profile.displayName,
          email: email,
          password: '',
          google: true
        });
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new LocalStrategy({ usernameField: 'email' },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return done(null, false, { message: 'No user found' });
      if (user.google) return done(null, false, { message: 'Use Google login' });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return done(null, false, { message: 'Incorrect password' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// ==================== ROUTES ==================== //

app.get('/', checkAuth, generateToken, (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  (req, res) => {
    req.session.token = crypto.randomBytes(32).toString('hex'); // Reset token on login
    res.redirect('/');
  }
);

app.get('/signup', (req, res) => {
  res.render('signup', { message: null });
});

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.render('signup', { message: 'Email or username already taken.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.render('signup', { message: 'Signup failed. Try again.' });
  }
});

app.get('/logout', (req, res) => {
  req.logout(err => {
    if (err) console.log(err);
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

// Google Auth
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    req.session.token = crypto.randomBytes(32).toString('hex'); // Reset token on Google login
    res.redirect('/');
  });

// Pollution Page
app.get('/pollution', checkAuth, generateToken, async (req, res) => {
  try {
    const records = await BigRecord.find().sort({ date: -1 }).limit(100);
    res.render('pollution', { records });
  } catch (err) {
    res.status(500).send('Error loading records');
  }
});

// Predict
app.post('/predict', async (req, res) => {
  try {
    const resp = await axios.post('http://127.0.0.1:5000/predict', req.body);
    res.json(resp.data);
  } catch (err) {
    res.status(500).send('AI Prediction Failed');
  }
});

// Add pollution record
app.post('/add', async (req, res) => {
  try {
    const { country, city, temperature, humidity, wind_speed, predicted_pollution, date } = req.body;
    const newRecord = new BigRecord({ country, city, temperature, humidity, wind_speed, predicted_pollution, date });
    await newRecord.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UI Pages
app.get('/search', checkAuth, generateToken, (req, res) => res.render('search'));
app.get('/world', checkAuth, generateToken, (req, res) => res.render('world'));

// Weather API
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
  console.log(`🌍 Server is running on http://localhost:${port}`);
});
