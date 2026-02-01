import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"]
  })
);

app.use(express.json());

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req, res) => {
  res.json({ ok: true, message: "Feasibility Engine backend running." });
});

async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json();

  if (!data?.candidates?.length) {
    throw new Error("Gemini returned no candidates");
  }

  return data.candidates[0].content.parts
    .map(p => p.text)
    .join("\n");
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
    console.error("Submit idea error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/reality-test", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
Reality-check this business idea against real-world constraints.
Be skeptical, practical, concrete, and realistic.

Business idea:
${idea}
`;

    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    console.error("Reality test error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
