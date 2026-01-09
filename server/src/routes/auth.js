const express = require('express');
const passport = require('passport');
const router = express.Router();

// Debug Route to verify /auth mounting
router.get('/debug', (req, res) => {
    res.json({
        message: "Auth Routes are mounted correctly!",
        db_connected: global.dbConnected,
        google_client_id_exists: !!process.env.GOOGLE_CLIENT_ID,
        callback_url: process.env.GOOGLE_CALLBACK_URL
    });
});

// Auth with Google
// Auth with Google
router.get('/google', (req, res, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(500).send("Login Failed: Server is missing Google OAuth Credentials (GOOGLE_CLIENT_ID). Please check Render Dashboard.");
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google Auth Callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL || '/' }),
    (req, res) => {
        if (!process.env.FRONTEND_URL) {
            console.error("REDIRECT FAILED: FRONTEND_URL is missing.");
            return res.status(500).send("Login Successful, but redirection failed because FRONTEND_URL is missing in environment variables.");
        }
        // Successful authentication, redirect to frontend dashboard
        // Appending trailing slash because trailingSlash: true is enabled in Next.js config
        res.redirect(`${process.env.FRONTEND_URL}/dashboard/`);
    }
);

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        if (!process.env.FRONTEND_URL) {
            console.error("LOGOUT REDIRECT FAILED: FRONTEND_URL is missing.");
            return res.json({ message: "Logged out successfully (API only)" });
        }
        res.redirect(process.env.FRONTEND_URL);
    });
});

// Current User
router.get('/current_user', async (req, res) => {
    // If authenticated via Google (or transient user), return that user
    if (req.user) {
        return res.json(req.user);
    }

    // If DB is offline and no user is authenticated, return a degraded state
    if (!global.dbConnected) {
        return res.json({
            id: 'guest',
            name: 'Guest User',
            isGuest: true,
            degradedMode: true
        });
    }

    // Otherwise, return the default hardcoded user for testing
    const User = require('../models/User');
    try {
        const defaultUser = await User.findById("659000000000000000000000");
        res.json(defaultUser || {});
    } catch (err) {
        res.json({});
    }
});

module.exports = router;
