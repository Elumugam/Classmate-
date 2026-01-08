const axios = require('axios');

async function testAIEndpoint() {
    try {
        console.log("Testing Main App AI Endpoint (with Fallback)...");
        const response = await axios.post('http://localhost:5000/api/chat', {
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
