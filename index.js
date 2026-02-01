import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing");
  process.exit(1);
}

app.get("/", (req, res) => {
  res.json({
    ok: true,
    message: "Reality Collision Engine backend running."
  });
});

async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json();

  console.log("🔍 Gemini raw response:", JSON.stringify(data));

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("Gemini returned no candidates");
  }

  const parts = data.candidates[0]?.content?.parts;

  if (!parts || parts.length === 0 || !parts[0].text) {
    throw new Error("Gemini returned empty content");
  }

  return parts.map(p => p.text).join("\n");
}

app.post("/submit-idea", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length === 0) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const prompt = `
Brutally analyze this business idea.
Highlight fatal flaws, unrealistic assumptions, and major market risks.

Business idea:
${idea}
`;

    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    console.error("❌ Submit idea error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/reality-test", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length === 0) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const prompt = `
Reality-check this business idea against real-world constraints.
Be skeptical, practical, and concrete.

Business idea:
${idea}
`;

    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    console.error("❌ Reality test error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
