const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Material = require('../models/Material');
const Timetable = require('../models/Timetable');
const User = require('../models/User');
const Activity = require('../models/Activity');
const Task = require('../models/Task');
const { parsePDF } = require('../utils/pdfParser');
const { getEmbedding, generateTimetable, chatWithPDF, generateStudyInsights, extractTextFromImage } = require('../utils/ai');
const { searchYouTube } = require('../utils/youtube');

// Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Controllers (Inline for simplicity or move to controllers folder)

// 1. Upload & Process File (PDF, Image, Text)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const filePath = req.file.path;
        const mimeType = req.file.mimetype;
        let text = "";

        // Extract Text based on file type
        if (mimeType === 'application/pdf') {
            text = await parsePDF(filePath);
        } else if (mimeType.startsWith('image/')) {
            const imageBuffer = fs.readFileSync(filePath);
            text = await extractTextFromImage(imageBuffer, mimeType);
        } else if (mimeType === 'text/plain') {
            text = fs.readFileSync(filePath, 'utf-8');
        } else {
            // Fallback for others (try basic read if text, otherwise error)
            return res.status(400).json({ error: 'Unsupported file type. Please upload PDF, Image, or Text file.' });
        }

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from file.' });
        }

        // Chunking Strategy (Simple: by paragraphs or fixed size)
        const chunks = text.match(/[\s\S]{1,1000}/g) || []; // 1000 char chunks

        // Compute Embeddings for chunks
        const embeddings = [];
        for (const chunk of chunks) {
            const vector = await getEmbedding(chunk);
            embeddings.push({ text: chunk, embedding: vector });
        }

        // Write embeddings to sidecar JSON
        const embeddingPath = filePath + '.embeddings.json';
        fs.writeFileSync(embeddingPath, JSON.stringify(embeddings));

        const material = new Material({
            user: "659000000000000000000000", // Hardcoded User ID for MVP/NoAuth testing
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: filePath,
            mimeType: mimeType
        });
        await material.save();

        res.json({ message: 'File uploaded and processed', materialId: material._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});

// 2. Chat with PDF
router.post('/chat', async (req, res) => {
    const { message, materialId, history } = req.body;
    try {
        let response;
        if (materialId) {
            // Chat with PDF Logic
            const material = await Material.findById(materialId);
            if (!material) return res.status(404).json({ error: 'Material not found' });

            const embeddingPath = material.path + '.embeddings.json';

            // Fix: If embeddings are missing, don't block. Just warn and proceed as regular chat.
            if (!fs.existsSync(embeddingPath)) {
                console.warn(`Embeddings missing for ${materialId}, falling back to general chat.`);
                response = await chatWithPDF(message, [], history || []); // Fallback
            } else {
                const embeddings = JSON.parse(fs.readFileSync(embeddingPath));
                response = await chatWithPDF(message, embeddings, history || []);
            }
        } else {
            // General AI Chat Logic
            response = await chatWithPDF(message, [], history || []);
        }

        res.json(response);
    } catch (error) {
        console.error("Chat API Error:", error);

        let statusCode = 500;
        let errorMessage = 'An internal server error occurred.';
        let errorCode = 'INTERNAL_SERVER_ERROR';

        // Check for OpenAI API specific errors
        if (error.status) {
            statusCode = error.status;
            errorMessage = error.message || 'AI Service Error';
            errorCode = error.code || 'AI_aSERVICE_ERROR';
        } else if (error.code === 'ECONNREFUSED') {
            statusCode = 503;
            errorMessage = 'AI Service unreachable. Please check server logs.';
            errorCode = 'SERVICE_UNAVAILABLE';
        } else if (error.message) {
            // Generic Error with message
            errorMessage = error.message;
        }

        res.status(statusCode).json({ error: errorMessage, code: errorCode });
    }
});

// 3. Tasks CRUD
router.get('/tasks', async (req, res) => {
    try {
        const userId = req.user ? req.user._id : "659000000000000000000000";
        const tasks = await Task.find({ user: userId }).sort({ startTime: 1, createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

router.post('/tasks', async (req, res) => {
    try {
        const userId = req.user ? req.user._id : "659000000000000000000000";
        const task = new Task({ ...req.body, user: userId });
        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task' });
    }
});

router.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

router.delete('/tasks/:id', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

// 4. Generate Timetable (Saves to Tasks)
router.post('/timetable', async (req, res) => {
    const { goals, preferences } = req.body;
    try {
        const timetableData = await generateTimetable(preferences, goals);
        const userId = req.user ? req.user._id : "659000000000000000000000";

        const newTasks = [];
        for (const dayGroup of timetableData.schedule) {
            for (const session of dayGroup.tasks) {
                const task = new Task({
                    user: userId,
                    title: session.topic,
                    subject: session.subject,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    color: '#6366f1' // Default color
                });
                newTasks.push(task);
            }
        }

        if (newTasks.length > 0) {
            await Task.insertMany(newTasks);
        }

        res.json({ message: 'Timetable generated and saved to tasks', tasks: newTasks });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate timetable' });
    }
});

// 5. Get Youtube Recommendations
router.get('/videos', async (req, res) => {
    const { topic } = req.query;
    if (!topic) return res.status(400).json({ error: 'Topic required' });

    const videos = await searchYouTube(topic);
    res.json(videos);
});

// 5. Study History Endpoints
router.get('/history', async (req, res) => {
    try {
        const userId = "659000000000000000000000"; // Mocked
        const activities = await Activity.find({ user: userId }).sort({ timestamp: -1 }).limit(50);

        // Calculate Time Data
        const stats = activities.reduce((acc, curr) => {
            acc.totalMinutes += (curr.duration || 0);
            if (curr.type === 'VIDEO') acc.videoMinutes += curr.duration;
            if (curr.type === 'CHAT') acc.chatMinutes += curr.duration;
            return acc;
        }, { totalMinutes: 0, videoMinutes: 0, chatMinutes: 0 });

        // Generate AI insights if it's a new day or on request
        let insights = null;
        try {
            if (activities.length > 0) {
                insights = await generateStudyInsights(activities.slice(0, 10));
            }
        } catch (aiErr) {
            console.error("AI Insights failed:", aiErr);
        }

        res.json({ activities, stats, insights });
    } catch (err) {
        console.error("History fetch error:", err);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

router.post('/log-activity', async (req, res) => {
    try {
        const { type, subject, topic, title, duration, metadata } = req.body;
        const activity = new Activity({
            user: "659000000000000000000000", // Mocked
            type, subject, topic, title, duration, metadata
        });
        await activity.save();
        res.status(201).json(activity);
    } catch (err) {
        res.status(500).json({ error: 'Failed to log activity' });
    }
});

// 6. User Preferences
router.put('/user/preferences', async (req, res) => {
    try {
        const userId = req.user ? req.user._id : "659000000000000000000000";
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { preferences: req.body } },
            { new: true, runValidators: true }
        );

        if (!user) {
            console.error(`User not found for ID: ${userId}`);
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.preferences);
    } catch (err) {
        console.error("Preferences Update Error:", err);
        res.status(500).json({ error: 'Failed to update preferences', details: err.message });
    }
});

// 7. Health Check
router.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

module.exports = router;
