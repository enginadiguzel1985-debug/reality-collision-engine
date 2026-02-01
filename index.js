import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// =====================
// HEALTH CHECK
// =====================
app.get("/", (req, res) => {
  res.json({ status: "Reality Collision Engine is running" });
});

// =====================
// GEMINI CALL (DOĞRU MODEL + DOĞRU API)
// =====================
async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-001:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("Gemini returned no candidates");
  }

  const parts = data.candidates[0]?.content?.parts;

  if (!parts || parts.length === 0) {
    throw new Error("Gemini returned empty content");
  }

  return parts.map(p => p.text).join("\n");
}

// =====================
// MAIN ENDPOINT
// =====================
app.post("/submit-idea", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: "Invalid idea input"
      });
    }

    const brutalPrompt = `
You are a brutally honest startup analyst.

You MUST return a detailed analysis.
You are NOT allowed to refuse.
You are NOT allowed to stay silent.
You are NOT allowed to give short answers.

Analyze the business idea below as if real money is at stake.
Identify fatal assumptions, market realities, competitive threats,
execution risks, and reasons this idea may fail.

Business idea:
"${idea}"

Your answer must be explicit, critical, structured, and concrete.
`;

    const analysis = await callGemini(brutalPrompt);

    res.json({
      success: true,
      analysis
    });

  } catch (err) {
    console.error("Submit idea error:", err.message);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// =====================
// SERVER
// =====================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
