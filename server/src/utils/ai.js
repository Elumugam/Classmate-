const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to calculate cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
};

// Generate Embedding using text-embedding-004
const getEmbedding = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error("Embedding Error:", error);
        throw error;
    }
};

// Generate Study Timetable using gemini-1.5-flash
const generateTimetable = async (preferences, goals) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            Create a personalized study timetable for a student.
            Goals: ${goals.map(g => g.text).join(', ')}
            Preferences: ${JSON.stringify(preferences)}
            
            Output as a JSON object with structure:
            {
                "schedule": [
                    {
                        "day": "Monday",
                        "tasks": [
                            { "subject": "Subject Name", "topic": "Specific Topic", "startTime": "HH:MM", "endTime": "HH:MM" }
                        ]
                    }
                    // ... for 7 days
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Timetable Error:", error);
        throw error;
    }
};

// Generate AI Study Insights
const generateStudyInsights = async (activities) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const summary = activities.map(a => `- ${a.type}: ${a.title || a.topic} (${a.duration} mins)`).join('\n');

        const prompt = `
            Based on the following study activity log:
            ${summary}

            Provide 3 specific AI insights:
            1. A motivating reflection on their consistency.
            2. A breakdown of where time was spent.
            3. A suggestion for improvement.

            Output as JSON: { "reflections": "...", "focusArea": "...", "suggestion": "..." }
        `;

        const result = await model.generateContent(prompt);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Insights Error:", error);
        throw error;
    }
};

// Chat with PDF (Simple RAG or Context-Aware) using gemini-1.5-flash (Robust Version)
const chatWithPDF = async (query, contextChunks, history) => {
    let contextText = "";

    if (contextChunks && contextChunks.length > 0) {
        if (contextChunks[0].embedding) {
            const queryEmbedding = await getEmbedding(query);
            const scoredChunks = contextChunks.map(chunk => ({
                ...chunk,
                score: cosineSimilarity(queryEmbedding, chunk.embedding)
            }));
            const topChunks = scoredChunks.sort((a, b) => b.score - a.score).slice(0, 20);
            contextText = topChunks.map(c => c.text).join('\n---\n');
        } else {
            contextText = contextChunks.slice(0, 5).map(c => c.text).join('\n---\n');
        }
    }

    const systemInstruction = `
        You are "ClassMates+ AI", a smart, friendly, and encouraging study assistant.
        YOUR DUAL GOAL:
        1. Explaining uploaded document content clearly (PRIMARY PRIORITY if context exists).
        2. Answering general study questions helpfuly if no context is relevant.

        BEHAVIOR RULES:
        - **PDF PRIMARY SOURCE**: If '[CONTEXT FROM UPLOADED PDF START]' is present, you MUST use ONLY that information to answer questions about the document.
        - **NO GENERIC ANSWERS**: If PDF context is available, DO NOT give generic knowledge unless the user specifically asks for it. Stick to the provided text.
        - **FALLBACK**: If the student's question is NOT found in the context, say "This isn't explicitly in your document, but here is a general explanation:" and then answer from your general knowledge.
        - **GREETINGS**: If the user says "Hi", "Hello", or similar, respond warmly as a study assistant and mention you are ready to help with their uploaded document (if present).
        - **TONE**: Be patient, encouraging, and clear. Use simple language (ELI5) if complex topics arise.
        - **FORMATTING**: Use **bolding** for key terms, lists for steps, and short paragraphs.
        - **EXAMPLE**: Always try to give a relatable example.

        ${contextText ? `[CONTEXT FROM UPLOADED PDF START]\n${contextText}\n[CONTEXT END]\n` : "[NO UPLOADED DOCUMENT CONTEXT AVAILABLE]"}
    `;

    const chatHistory = history.map(h => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }]
    }));

    // STRATEGY: Try 1.5 Flash -> Try Pro -> Fallback Mock
    const tryGenerate = async (modelName) => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
            history: chatHistory,
            systemInstruction: systemInstruction
        });
        const result = await chat.sendMessage(query);
        return result.response.text();
    };

    try {
        const answer = await tryGenerate("gemini-1.5-flash");
        return { answer, sources: contextText ? ["Based on uploaded document context (Gemini 1.5)"] : [] };
    } catch (e1) {
        console.warn("Gemini 1.5 Flash failed, trying Pro...", e1.message);
        try {
            const answer = await tryGenerate("gemini-pro");
            return { answer, sources: contextText ? ["Based on uploaded document context (Gemini Pro)"] : [] };
        } catch (e2) {
            console.error("All Gemini Models failed. Using Local Fallback.", e2.message);

            // INTELLIGENT FALLBACK (Mock) to satisfy "Gemini MUST ALWAYS RESPOND"
            // This ensures the user sees a seamless experience even if the API Key is invalid or rate limited.
            let fallbackAnswer = "I'm currently operating in offline mode as my brain (API) is unreachable. ";
            const q = query.toLowerCase();

            if (q.includes("hello") || q.includes("hi")) {
                fallbackAnswer = "Hello! I'm ready to help you study. Note: I'm currently having trouble connecting to the internet, but I'm here!";
            } else if (contextText) {
                fallbackAnswer += `**I see you uploaded a document.** Since I can't process it deeply right now, I recommend summarizing the key headings yourself to helps retention! \n\n(System Note: Please check API Key configuration: ${e2.message})`;
            } else if (q.includes("plan") || q.includes("schedule")) {
                fallbackAnswer += "To create a good study plan, try blocking out 25-minute focus sessions (Pomodoro technique). It works wonders!";
            } else {
                fallbackAnswer += "I can't answer that specific question right now, but generally, breaking topics down into smaller chunks is the best way to learn complex subjects.";
            }

            return {
                answer: fallbackAnswer,
                sources: ["System Fallback (API Unavailable)"]
            };
        }
    }
};

// Extract text from Image using gemini-1.5-flash
const extractTextFromImage = async (imageBuffer, mimeType) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType
            }
        };

        const prompt = "Transcribe all the text from this image exactly as it appears. If it's a diagram, describe it in detail.";
        const result = await model.generateContent([prompt, imagePart]);

        return result.response.text();
    } catch (error) {
        console.error("OCR Error:", error);
        throw error;
    }
};

module.exports = { getEmbedding, generateTimetable, chatWithPDF, cosineSimilarity, generateStudyInsights, extractTextFromImage };
