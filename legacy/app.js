const challenges = [
    {
        title: "Product Description",
        description: "Write a short product description for a high-end noise-canceling headphone brand named 'Aura'. The target audience is busy professionals who travel frequently.",
        goal: "Engage professionals with emotional benefits and clear value."
    },
    {
        title: "Code Bug Helper",
        description: "Explain why this JavaScript code is causing a memory leak: 'setInterval(() => { const data = new Array(1000).fill(\"x\"); console.log(data); }, 100);'",
        goal: "Provide a clear, technical explanation and a fix."
    }
];

let currentChallengeIndex = 0;

async function callGemini(apiKey, prompt) {
    const response = await fetch('https://llm.wokushop.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gemini-2.5-flash',
            messages: [
                { role: 'user', content: prompt }
            ],
            temperature: 0.7
        })
    });
    
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    if (data.error) throw new Error(data.error.message || 'API Error');
    return data.choices[0].message.content;
}

async function evaluatePrompt(apiKey, userPrompt, challenge) {
    const evaluationPrompt = `
        You are an expert Prompt Engineer. Evaluate the following prompt for the challenge: "${challenge.description}".
        
        User's Prompt: "${userPrompt}"
        
        Evaluate based on:
        1. ERA (Entity, Role, Action)
        2. Few-shot (Examples provided?)
        3. CoT (Chain of Thought - step-by-step logic?)
        
        Output MUST be valid JSON with this structure:
        {
            "score": number (0-100),
            "feedback": "Why the suggestion is better and what the human can improve. Mention ERA, Few-shot, CoT specifically.",
            "suggestion": "Rewrite the user's prompt using ERA, Few-shot, and CoT to get the best result.",
            "techniqueCheck": { "era": boolean, "fewShot": boolean, "cot": boolean }
        }
        
        Return ONLY the JSON. No markdown blocks.
    `;
    
    const result = await callGemini(apiKey, evaluationPrompt);
    try {
        // Handle potential markdown backticks in response
        const cleanResult = result.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanResult);
    } catch (e) {
        console.error("Failed to parse AI response as JSON", result);
        throw new Error("AI evaluation failed to format correctly. Try again.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const userPromptInput = document.getElementById('userPrompt');
    const submitBtn = document.getElementById('submitBtn');
    const aiSide = document.getElementById('aiSide');
    
    // UI Elements
    const challengeTitle = document.getElementById('challengeTitle');
    const challengeDesc = document.getElementById('challengeDescription');
    const userResult = document.getElementById('userResult');
    const aiFeedback = document.getElementById('aiFeedback');
    const suggestedPrompt = document.getElementById('suggestedPrompt');
    const aiResult = document.getElementById('aiResult');
    const scoreValue = document.getElementById('scoreValue');
    const scoreFill = document.getElementById('scoreFill');

    // Initialize first challenge
    function loadChallenge() {
        const currentChallenge = challenges[currentChallengeIndex];
        if (challengeTitle && challengeDesc) {
            challengeTitle.innerText = currentChallenge.title;
            challengeDesc.innerText = currentChallenge.description;
        }
    }
    loadChallenge();

    // Copy functionality
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.addEventListener('click', () => {
        const text = suggestedPrompt.innerText;
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.innerText;
            copyBtn.innerText = "Copied!";
            setTimeout(() => copyBtn.innerText = originalText, 2000);
        });
    });

    submitBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const prompt = userPromptInput.value.trim();

        if (!apiKey) {
            alert("Please enter your Gemini API Key first!");
            return;
        }
        if (!prompt) {
            alert("Please type a prompt!");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.innerText = "Analyzing...";
        userResult.innerText = "Executing your prompt...";

        try {
            const challenge = challenges[currentChallengeIndex];
            // 1. Execute user prompt to see result
            const userResponse = await callGemini(apiKey, prompt);
            userResult.innerText = userResponse;

            // 2. Get AI evaluation and suggestion
            const evaluation = await evaluatePrompt(apiKey, prompt, challenge);
            
            // 3. Reveal right side
            aiSide.classList.remove('hidden');
            aiFeedback.innerText = evaluation.feedback;
            suggestedPrompt.innerText = evaluation.suggestion;
            
            // 4. Update score
            scoreValue.innerText = `${evaluation.score}%`;
            scoreFill.style.width = `${evaluation.score}%`;

            // 5. Execute suggested prompt for comparison
            aiResult.innerText = "Executing suggested prompt...";
            const aiResponse = await callGemini(apiKey, evaluation.suggestion);
            aiResult.innerText = aiResponse;

            if (evaluation.score > 80) {
                startConfetti();
            }

        } catch (error) {
            alert("Error: " + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = "Submit Answer";
        }
    });
});

// Better Confetti effect
function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    for (let i = 0; i < 200; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: -20,
            size: Math.random() * 8 + 4,
            color: `hsl(${Math.random() * 360}, 80%, 60%)`,
            speed: Math.random() * 5 + 3,
            angleX: Math.random() * 6.28,
            angleY: Math.random() * 6.28,
            rotationSpeed: Math.random() * 0.2 - 0.1
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        particles.forEach(p => {
            p.y += p.speed;
            p.x += Math.sin(p.angleX) * 2;
            p.angleX += 0.05;
            
            if (p.y < canvas.height) {
                active = true;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angleY);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                ctx.restore();
                p.angleY += p.rotationSpeed;
            }
        });
        if (active) {
            requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    animate();
}
