import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// sağlık kontrolü
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Feasibility Engine backend running." });
});

// 1️⃣ Assumption & Risk Analysis
app.post("/submit-idea", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
Brutally analyze this business idea.
Highlight fatal flaws, unrealistic assumptions, and major market risks.

Business idea:
${idea}
`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const aiData = await aiRes.json();
    const aiText =
      aiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No analysis generated.";

    res.json({ result: aiText });
  } catch (err) {
    res.status(500).json({ error: "AI analysis failed." });
  }
});

// 2️⃣ Reality Collision
app.post("/reality-test", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
Reality-check this business idea against real-world constraints.
Be skeptical, practical, and concrete.

Business idea:
${idea}
`;

    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const aiData = await aiRes.json();
    const aiText =
      aiData.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No reality test generated.";

    res.json({ result: aiText });
  } catch (err) {
    res.status(500).json({ error: "Reality test failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
