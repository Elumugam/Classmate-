const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    schedule: [{
        day: String,
        tasks: [{
            subject: String,
            topic: String,
            startTime: String,
            endTime: String,
            completed: { type: Boolean, default: false }
        }]
    }],
    generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Timetable', TimetableSchema);
