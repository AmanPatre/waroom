const fs = require('fs');

async function testAgent() {
    const rawEnv = fs.readFileSync('.env', 'utf-8');
    const apiKey = rawEnv.match(/GEMINI_API_KEY=(.+)/)[1].trim();

    const systemInstruction = `You are SCOUT, the elite intelligence gathering agent.
You must analyze the incoming crisis and synthesize raw facts.
Output ONLY strict JSON matching this exact schema:
{
  "reasoning": "your step-by-step intelligence breakdown",
  "decision": "the single most actionable intel to pass to the strategist",
  "confidence": 0.95,
  "memory_to_store": "1 key technical detail to memorize",
  "message_to_strategist": "your briefing summary"
}`;

    const promptText = `CRISIS: We have 2 hours to decide our response to a competitor's price drop.
MEM0 DATA: No previous data found.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "systemInstruction": { "parts": [ { "text": systemInstruction } ] },
            "contents": [ { "role": "user", "parts": [ { "text": promptText } ] } ],
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

testAgent();
