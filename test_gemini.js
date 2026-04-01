const fs = require('fs');

async function testGemini() {
    const rawEnv = fs.readFileSync('.env', 'utf-8');
    const apiKey = rawEnv.match(/GEMINI_API_KEY=(.+)/)[1].trim();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "systemInstruction": {
                "parts": [ { "text": "Reply with test" } ]
            },
            "contents": [
                { "role": "user", "parts": [ { "text": "Are you working?" } ] }
            ],
            "generationConfig": {
                "temperature": 0.4,
                "responseMimeType": "application/json"
            }
        })
    });

    const text = await response.text();
    console.log("STATUS:", response.status);
    console.log("RESPONSE:", text);
}

testGemini();
