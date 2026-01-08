const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.warn("WARNING: MONGODB_URI is processing missing. Database will not connect.");
            return;
        }
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // Do not crash, allow server to start for health checks
        // process.exit(1); 
    }
};

module.exports = connectDB;
