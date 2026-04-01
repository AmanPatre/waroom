const fs = require('fs');

async function testMem0() {
    const rawEnv = fs.readFileSync('.env', 'utf-8');
    const apiKey = rawEnv.match(/MEM0_API_KEY=(.+)/)[1].trim();
    
    // Add as user
    const res = await fetch('https://api.mem0.ai/v1/memories/', {
        method: 'POST',
        headers: {
            'Authorization': 'Token ' + apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [{ role: 'user', content: 'My name is Agent Scout and my strategy is to drop prices by 20%.' }],
            user_id: 'test_user_123'
        })
    });
    console.log(await res.json());
}
testMem0();
