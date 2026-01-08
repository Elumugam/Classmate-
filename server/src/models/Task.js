const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    subject: { type: String },
    description: { type: String },
    startTime: { type: Date }, // Optional: If present, it's a scheduled task
    endTime: { type: Date },   // Optional
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    color: { type: String, default: '#6366f1' }, // Default indigo-500
    reminders: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', TaskSchema);
