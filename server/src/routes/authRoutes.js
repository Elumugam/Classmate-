const express = require('express');
const passport = require('passport');
const router = express.Router();

// Auth with Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Auth Callback
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        // Successful authentication, redirect to frontend dashboard
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(process.env.FRONTEND_URL);
    });
});

// Current User
router.get('/current_user', async (req, res) => {
    // If authenticated via Google, return that user
    if (req.user) {
        return res.json(req.user);
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
