const fs = require('fs');

async function testGemini() {
    try {
        const rawEnv = fs.readFileSync('.env', 'utf-8');
        const apiKey = rawEnv.match(/GEMINI_API_KEY=(.+)/)[1].trim();
        
        console.log("Testing gemini-1.5-flash (stable production model)...");
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "contents": [ { "role": "user", "parts": [ { "text": "Reply with 'OK'." } ] } ],
                "generationConfig": { "temperature": 0.1 }
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        const text = await response.text();
        console.log("STATUS:", response.status);
        console.log("RESPONSE:", text);
    } catch (e) {
        console.error("Test Failed:", e.message);
    }
}

testGemini();
