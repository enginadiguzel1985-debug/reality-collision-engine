import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ==========================
// HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.json({ status: "Reality Collision Engine running" });
});

// ==========================
// GEMINI CALL (CORRECT MODEL)
// ==========================
async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
  console.log("Gemini raw response:", JSON.stringify(data));

  const parts = data?.candidates?.[0]?.content?.parts;

  if (!parts || parts.length === 0) {
    throw new Error("Gemini returned empty content");
  }

  return parts.map(p => p.text).join("\n");
}

// ==========================
// FALLBACK (ONLY IF AI FAILS)
// ==========================
function fallbackAnalysis(idea) {
  return `
BRUTALLY HONEST BASELINE ANALYSIS (Fallback)

Business Idea:
"${idea}"

Key Assumption:
You assume demand exists without proving it.

Reality:
Most ideas fail here.

Next Step:
Explicitly list what MUST be true for this to work.
`;
}

// ==========================
// MAIN ENDPOINT
// ==========================
app.post("/submit-idea", async (req, res) => {
  const { idea } = req.body;

  if (!idea || idea.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: "Idea is too short"
    });
  }

  const prompt = `
You are a brutally honest startup analyst.

Your task:
1. Identify the key assumptions in the idea.
2. Point out logical contradictions or delusions.
3. Explain why the idea is likely to fail in the real world.
4. Do NOT be polite. Be precise.

Business idea:
"${idea}"
`;

  try {
    const analysis = await callGemini(prompt);

    return res.json({
      success: true,
      analysis
    });

  } catch (err) {
    console.error("AI FAILED → FALLBACK USED:", err.message);

    return res.json({
      success: true,
      analysis: fallbackAnalysis(idea)
    });
  }
});

// ==========================
// SERVER
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
