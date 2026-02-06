import express from "express";

const app = express();
app.use(express.json());

/* ===============================
   🔒 HARD FAIL CHECKS
================================ */

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Deploy blocked.");
}

/* ===============================
   🔒 MASTER PROMPTS (SHORT TEST)
================================ */

const DECISION_STRESS_TEST_PROMPT = `
You brutally stress-test business ideas.
Expose false assumptions, weak logic, and structural risks.
Be direct. No motivation.
`;

const REALITY_COLLISION_PROMPT = `
You collide ideas with real-world constraints.
Evaluate feasibility, execution friction, and market reality.
No optimism. Reality only.
`;

if (!DECISION_STRESS_TEST_PROMPT || !REALITY_COLLISION_PROMPT) {
  throw new Error("Master prompts missing. Deploy blocked.");
}

/* ===============================
   🔧 GEMINI CALL
================================ */

async function callGemini(prompt, idea) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${prompt}\n\nIDEA:\n${idea}` }]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

/* ===============================
   🚀 ROUTES
================================ */

app.post("/decision-stress-test", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea required." });

    const result = await callGemini(DECISION_STRESS_TEST_PROMPT, idea);
    res.json({ result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

app.post("/reality-collision", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea required." });

    const result = await callGemini(REALITY_COLLISION_PROMPT, idea);
    res.json({ result });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

/* ===============================
   🌐 SERVER
================================ */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
