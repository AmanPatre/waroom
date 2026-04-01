const fs = require('fs');

async function listModels() {
    const rawEnv = fs.readFileSync('.env', 'utf-8');
    const apiKey = rawEnv.match(/GEMINI_API_KEY=(.+)/)[1].trim();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("STATUS:", response.status);
    data.models.forEach(m => console.log(m.name));
}

listModels();
