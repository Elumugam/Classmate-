const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // If DB is offline, create a transient user object
                if (!global.dbConnected) {
                    console.warn("⚠️ Database offline: Using transient user for session.");
                    const transientUser = {
                        id: `transient_${profile.id}`,
                        googleId: profile.id,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        picture: profile.photos[0].value,
                        isTransient: true
                    };
                    return done(null, transientUser);
                }

                let user = await User.findOne({ googleId: profile.id });
                if (user) {
                    return done(null, user);
                }
                user = new User({
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    picture: profile.photos[0].value
                });
                await user.save();
                done(null, user);
            } catch (err) {
                console.error("Passport Strategy Error:", err);
                done(err, null);
            }
        }
    ));
} else {
    console.warn("WARNING: Google OAuth credentials missing. Auth will not work.");
}

passport.serializeUser((user, done) => {
    // If it's a transient user, serialize the whole object or a special ID
    if (user.isTransient) {
        done(null, JSON.stringify(user));
    } else {
        done(null, user.id);
    }
});

passport.deserializeUser(async (id, done) => {
    try {
        // If the id looks like a transient user JSON
        if (typeof id === 'string' && id.startsWith('{"isTransient":true')) {
            return done(null, JSON.parse(id));
        }

        if (!global.dbConnected) {
            return done(null, null); // Cannot fetch full user if DB is down
        }

        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        console.error("Passport Deserialization Error:", err);
        done(err, null);
    }
});
