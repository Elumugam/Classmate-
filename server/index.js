const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const connectDB = require('./src/config/db');

// Load Config
dotenv.config();
require('./src/config/passport'); // Passport config

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

// Sessions
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if https
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', require('./src/routes/authRoutes'));
app.use('/api', require('./src/routes/apiRoutes'));

// Global 404 Handler to debug missing routes
app.use((req, res, next) => {
    if (req.path === '/') return next(); // handled below
    console.log(`[404] Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'ClassMate+ API is running',
        auth_configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
