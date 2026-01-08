const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    path: { type: String, required: true },
    mimeType: { type: String },
    summary: { type: String }, // AI generated summary
    topics: [String], // AI extracted topics
    embeddings: { type: Array }, // Placeholder for simple vector storage if needed here
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Material', MaterialSchema);
