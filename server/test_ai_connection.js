const axios = require('axios');

async function testAIEndpoint() {
    try {
        const API_URL = process.env.API_URL || 'http://localhost:5000';
        console.log(`Testing AI Endpoint at ${API_URL}...`);
        const response = await axios.post(`${API_URL}/api/chat`, {
            message: "Hello, are you online?",
            history: []
        });
        console.log("SUCCESS! App Responded:");
        console.log(response.data);
    } catch (error) {
        console.error("FAILED! Endpoint crashed:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data: ${JSON.stringify(error.response.data)}`);
        } else {
            console.error(error.message);
        }
    }
}

testAIEndpoint();
