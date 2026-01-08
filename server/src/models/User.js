const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    picture: { type: String },
    studyGoals: [{
        text: String,
        completed: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }],
    streak: {
        count: { type: Number, default: 0 },
        lastLogin: { type: Date }
    },
    preferences: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        accentColor: { type: String, default: '#6366f1' },
        sidebarCollapsed: { type: Boolean, default: false }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
