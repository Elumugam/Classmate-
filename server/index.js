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

// Safety Check for Frontend URL
if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    console.warn("CRITICAL WARNING: FRONTEND_URL is not defined. CORS and OAuth redirects will fail.");
}

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

// Trust Proxy for Render/Netlify (Required for secure cookies)
app.set('trust proxy', 1);

// Sessions
const sessionSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET || 'dev-fallback-secret-do-not-use-in-prod';
if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
    console.warn("WARNING: SESSION_SECRET is missing in production! Using fallback.");
}

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Must be 'none' for cross-site cookies
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', require('./src/routes/auth'));
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
        db_connected: global.dbConnected,
        auth_configured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Registered Routes:");
    console.log("- /auth/debug");
    console.log("- /auth/google");
    console.log("- /auth/google/callback");
});
