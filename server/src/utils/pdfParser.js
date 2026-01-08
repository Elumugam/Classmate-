const fs = require('fs');
const pdf = require('pdf-parse');

const parsePDF = async (filePath) => {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text; // Returns the full text content nicely
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to parse PDF');
    }
};

module.exports = { parsePDF };
