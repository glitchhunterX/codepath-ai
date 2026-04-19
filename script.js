// Theme toggle
function initTheme() {
    const saved = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

// Mobile hamburger menu
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

// Progress tracker
function startPath(level) {
    localStorage.setItem('currentPath', level);
    alert(`🚀 Starting ${level.toUpperCase()} path!`);
    renderProgress();
}

function renderProgress() {
    const el = document.getElementById('progress-status');
    if (el) {
        const path = localStorage.getItem('currentPath') || 'None';
        el.textContent = `Current Path: ${path.charAt(0).toUpperCase() + path.slice(1)}`;
    }
}

// Gemini API Key
function saveApiKey() {
    const key = document.getElementById('api-key').value.trim();
    if (key && key.startsWith('AIza')) {
        localStorage.setItem('geminiApiKey', key);
        alert('✅ Gemini API key saved successfully!\nYou can now use real AI.');
    } else {
        alert('Please paste a valid Gemini API key (it should start with AIza...)');
    }
}

function getApiKey() {
    return localStorage.getItem('geminiApiKey');
}

// Real Gemini API call
async function callGemini(prompt) {
    const apiKey = getApiKey();
    if (!apiKey) {
        return "⚠️ No API key saved.\n\nPaste your Gemini key in the box above and click 'Save API Key' to activate real AI responses.";
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a patient, excellent coding tutor. Explain concepts clearly with step-by-step reasoning, code examples, and encouragement. Support all programming languages.\n\nUser question: ${prompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000
                }
            })
        });

        if (!response.ok) {
            if (response.status === 429) return "⏳ Free tier rate limit reached. Wait 30–60 seconds and try again.";
            return `API Error (${response.status}). Please check your key or try again later.`;
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
    } catch (err) {
        console.error(err);
        return "❌ Connection error. Please check your internet and make sure the API key is correct.";
    }
}

// Send message using real Gemini
async function sendGeminiMessage() {
    const input = document.getElementById('user-input');
    const chat = document.getElementById('chat-messages');
    if (!input || !chat) return;

    const text = input.value.trim();
    if (!text) return;

    // Add user message
    const userMsg = document.createElement('div');
    userMsg.className = 'message user';
    const userAvatar = document.createElement('div');
    userAvatar.className = 'avatar user-avatar';
    userAvatar.textContent = '👤';
    const userBubble = document.createElement('div');
    userBubble.className = 'bubble';
    userBubble.textContent = text;
    userMsg.appendChild(userAvatar);
    userMsg.appendChild(userBubble);
    chat.appendChild(userMsg);

    input.value = '';

    // Typing indicator
    const typing = document.createElement('div');
    typing.className = 'message ai-msg';
    typing.innerHTML = `
        <div class="avatar ai-avatar">✨</div>
        <div class="typing">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    chat.appendChild(typing);
    chat.scrollTop = chat.scrollHeight;

    const reply = await callGemini(text);

    chat.removeChild(typing);

    // Add AI response with refined animation
    const aiMsg = document.createElement('div');
    aiMsg.className = 'message ai-msg';
    const aiAvatar = document.createElement('div');
    aiAvatar.className = 'avatar ai-avatar';
    aiAvatar.textContent = '✨';
    const aiBubble = document.createElement('div');
    aiBubble.className = 'bubble';
    aiBubble.textContent = reply;
    aiMsg.appendChild(aiAvatar);
    aiMsg.appendChild(aiBubble);
    chat.appendChild(aiMsg);
    chat.scrollTop = chat.scrollHeight;
}

function addSuggestion(text) {
    const input = document.getElementById('user-input');
    if (input) {
        input.value = text;
        sendGeminiMessage();
    }
}

function clearChat() {
    const chat = document.getElementById('chat-messages');
    if (chat) {
        chat.innerHTML = `
            <div class="message ai-msg">
                <div class="avatar ai-avatar">✨</div>
                <div class="bubble">
                    👋 Hello! Paste your Gemini API key above to unlock real AI help.<br>
                    Ask me anything about coding — I'll explain step by step with examples.
                </div>
            </div>
        `;
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    initTheme();

    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
    document.querySelector('.hamburger')?.addEventListener('click', toggleMenu);

    renderProgress();

    // Enter key support
    const inputField = document.getElementById('user-input');
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendGeminiMessage();
        });
    }

    // Welcome message
    const chat = document.getElementById('chat-messages');
    if (chat && chat.children.length === 0) {
        const welcome = document.createElement('div');
        welcome.className = 'message ai-msg';
        welcome.innerHTML = `
            <div class="avatar ai-avatar">✨</div>
            <div class="bubble">
                👋 Welcome to the Real Gemini Coding Tutor!<br>
                Enter your free API key above, then ask questions like "explain loops in Python" or "give me a JavaScript project".
            </div>
        `;
        chat.appendChild(welcome);
    }
});