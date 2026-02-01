import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Reality Collision Engine is running" });
});

// === GEMINI CALL ===
async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

// === MAIN ENDPOINT ===
app.post("/submit-idea", async (req, res) => {
  try {
    const { idea } = req.body;

    if (!idea || idea.trim().length < 5) {
      return res.status(400).json({
        error: "Invalid idea input"
      });
    }

    const prompt = `
You are a brutally honest startup analyst.

Analyze the following business idea in detail.
Focus on assumptions, risks, competition, feasibility, and why it may fail.

Business idea:
"${idea}"
`;

    const analysis = await callGemini(prompt);

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

// === SERVER ===
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
