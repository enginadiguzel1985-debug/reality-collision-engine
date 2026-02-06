import express from "express";

const app = express();
app.use(express.json());

/* ===============================
   🔒 HARD FAIL SAFETY CHECKS
================================ */

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is missing. Deploy blocked.");
}

/* ===============================
   🔒 MASTER PROMPTS (SHORT TEST VERSION)
   (UZUN HALİ SONRA GERİ EKLENECEK)
================================ */

const DECISION_STRESS_TEST_PROMPT = `
You are an AI that brutally stress-tests business ideas.
Point out logical gaps, unrealistic assumptions, and hidden risks.
Be direct and factual.
`;

const REALITY_COLLISION_PROMPT = `
You are an AI that collides ideas with real-world constraints.
Evaluate feasibility, market friction, and execution risk.
No motivation. No optimism. Reality only.
`;

if (!DECISION_STRESS_TEST_PROMPT || !REALITY_COLLISION_PROMPT) {
  throw new Error("Master prompts are missing. Deploy blocked.");
}

/* ===============================
   🔧 AI CALL FUNCTION
================================ */

async function callAI(prompt, idea) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: idea }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI API error: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/* ===============================
   🚀 ROUTES
================================ */

app.post("/decision-stress-test", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea is required." });
    }

    const result = await callAI(DECISION_STRESS_TEST_PROMPT, idea);
    res.json({ result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

app.post("/reality-collision", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) {
      return res.status(400).json({ error: "Idea is required." });
    }

    const result = await callAI(REALITY_COLLISION_PROMPT, idea);
    res.json({ result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

/* ===============================
   🌐 SERVER START
================================ */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
