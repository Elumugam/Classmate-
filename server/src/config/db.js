const mongoose = require('mongoose');

// Global flag to track DB connectivity
global.dbConnected = false;

// Disable Mongoose buffering globally to prevent hangs when DB is offline
mongoose.set('bufferCommands', false);

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn("⚠️  WARNING: MONGODB_URI is missing. App running in DEGRADED MODE (Offline/No DB).");
            global.dbConnected = false;
            return false;
        }

        // Add timeout to prevent long hangs if DB is unreachable
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // 5 seconds timeout
            socketTimeoutMS: 45000,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        global.dbConnected = true;

        // Re-enable buffering if we successfully connected? 
        // Actually, better to keep it off if we want to be strictly responsive.
        // But for production stability with short blips, buffering is usually good.
        // Given the requirement "No buffering timeout errors", keeping it false is safer.

        return true;
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        console.warn("⚠️  App will continue to run in DEGRADED MODE without database features.");
        global.dbConnected = false;
        return false;
    }
};

module.exports = connectDB;
