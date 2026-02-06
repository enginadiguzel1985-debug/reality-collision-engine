// index.js
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ZORUNLU: Render environment variable kontrolü
const REQUIRED_ENV_VARS = [
  'GEMINI_API_KEY',
  'GOOGLE_GEMINI_API_KEY',
  'INTERNAL_API_KEY'
];

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key] || process.env[key].trim() === '') {
    console.error(`ERROR: Required environment variable ${key} is missing or empty.`);
    process.exit(1); // Deploy durur
  }
}

// ------------------------------
// PROMPT TANIMLARI (FİZİKSEL)
// ------------------------------

const PROMPTS = {
  FORM1: `You are the AI evaluator. Analyze the user's assumption and provide a clear assessment that challenges the assumption.`,
  FORM2: `You are the AI continuation evaluator. Based on Form 2 data, generate refined insights and prepare input for reality collision.`,
  DECISION_STRESS_TEST: `Evaluate the idea for feasibility, potential risks, and opportunities.`,
  REALITY_COLLISION: `Simulate the idea against real-world constraints and provide an actionable outcome.`
};

// ------------------------------
// ENDPOINTLER
// ------------------------------

// Form 1 submit
app.post('/form1-submit', async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    // AI çağrısı
    const response = await fetch('https://api.example.com/form1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({ prompt: PROMPTS.FORM1, idea })
    });

    const data = await response.json();
    res.json({ result: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Form 2 submit
app.post('/form2-submit', async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    const response = await fetch('https://api.example.com/form2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({ prompt: PROMPTS.FORM2, idea })
    });

    const data = await response.json();
    res.json({ result: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Decision stress test
app.post('/decision-stress-test', async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    const response = await fetch('https://api.example.com/decision-stress-test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOGLE_GEMINI_API_KEY}`
      },
      body: JSON.stringify({ prompt: PROMPTS.DECISION_STRESS_TEST, idea })
    });

    const data = await response.json();
    res.json({ result: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// Reality collision
app.post('/reality-collision', async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: 'Idea is required' });

    const response = await fetch('https://api.example.com/reality-collision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GOOGLE_GEMINI_API_KEY}`
      },
      body: JSON.stringify({ prompt: PROMPTS.REALITY_COLLISION, idea })
    });

    const data = await response.json();
    res.json({ result: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// ------------------------------
// SERVER START
// ------------------------------

app.listen(PORT, () => {
  console.log(`Render AI backend running on port ${PORT}`);
});
