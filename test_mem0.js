const fs = require('fs');

async function checkMem0() {
    const rawEnv = fs.readFileSync('.env', 'utf-8');
    const apiKey = rawEnv.match(/MEM0_API_KEY=(.+)/)[1].trim();

    const agents = ["agent_scout", "agent_strategist", "agent_devils_advocate"];
    for (const agent of agents) {
        console.log(`\n--- Memories for ${agent} ---`);
        const response = await fetch(`https://api.mem0.ai/v1/memories/?user_id=${agent}`, {
            headers: {
                "Authorization": `Token ${apiKey}`
            }
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    }
}
checkMem0();
