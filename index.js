import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Feasibility Engine backend running." });
});

async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

  // 🔥 ASIL KRİTİK SATIR
  return (
    data?.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .join("\n") ||
    "Gemini returned an empty response."
  );
}

app.post("/submit-idea", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
Brutally analyze this business idea.
Highlight fatal flaws, unrealistic assumptions, and major market risks.

Business idea:
${idea}
`;

    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI analysis failed" });
  }
});

app.post("/reality-test", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
Reality-check this business idea against real-world constraints.
Be skeptical, practical, and concrete.

Business idea:
${idea}
`;

    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Reality test failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
