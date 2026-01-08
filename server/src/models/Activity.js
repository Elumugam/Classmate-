const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['CHAT', 'VIDEO', 'PDF_READ', 'PDF_UPLOAD'],
        required: true
    },
    subject: { type: String, default: 'General' },
    topic: { type: String },
    title: { type: String }, // Video title, PDF name, or chat summary
    duration: { type: Number, default: 0 }, // in minutes
    metadata: {
        videoId: String,
        fileId: mongoose.Schema.Types.ObjectId,
        summary: String,
        searchQuery: String
    },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);
