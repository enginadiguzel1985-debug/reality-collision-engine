import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// =======================
// HEALTH CHECK
// =======================
app.get("/", (req, res) => {
  res.json({ status: "Reality Collision Engine is running" });
});

// =======================
// FALLBACK ANALYSIS (NO AI)
// =======================
function fallbackAnalysis(idea) {
  return `
BRUTALLY HONEST BASELINE ANALYSIS (AI FALLBACK MODE)

Business Idea:
"${idea}"

1. Core Assumption
You assume there is unmet demand or differentiation opportunity.
This is usually false unless proven by location-specific data.

2. Primary Risks
- Existing competitors already dominate customer attention.
- Fixed costs (rent, labor, permits) will eat margins early.
- Customer acquisition cost is higher than expected.

3. Market Reality
Most small businesses fail due to:
- Overestimating demand
- Underestimating operational friction
- Lack of real differentiation

4. Feasibility Snapshot
This idea is feasible ONLY if:
- You have a structural advantage (location, cost, distribution)
- Or a clearly unfair edge competitors cannot copy quickly

5. Verdict
This idea is NOT automatically bad,
but it is weak without hard evidence and execution leverage.

Next Step:
Validate demand with real-world constraints before committing capital.
`;
}

// =======================
// GEMINI CALL (NON-CRITICAL)
// =======================
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

  const parts = data?.candidates?.[0]?.content?.parts;
  if (!parts || parts.length === 0) {
    return null; // 👈 IMPORTANT: no throw
  }

  return parts.map(p => p.text).join("\n");
}

// =======================
// MAIN ENDPOINT
// =======================
app.post("/submit-idea", async (req, res) => {
  const { idea } = req.body;

  if (!idea || idea.trim().length < 10) {
    return res.status(200).json({
      success: true,
      analysis: fallbackAnalysis(idea || "No clear idea provided.")
    });
  }

  const prompt = `
You are a brutally honest startup analyst.

Analyze the following business idea in detail.
Focus on assumptions, risks, competition, feasibility, and why it may fail.

Business idea:
"${idea}"
`;

  try {
    const analysis = await callGemini(prompt);

    // ✅ AI SUCCESS
    if (analysis) {
      return res.json({
        success: true,
        analysis
      });
    }

    // ⚠️ AI EMPTY → FALLBACK
    console.warn("Gemini returned empty content, using fallback.");

    return res.json({
      success: true,
      analysis: fallbackAnalysis(idea)
    });

  } catch (err) {
    console.error("Gemini hard failure, using fallback:", err.message);

    // 🚑 AI HARD FAIL → FALLBACK
    return res.json({
      success: true,
      analysis: fallbackAnalysis(idea)
    });
  }
});

// =======================
// SERVER
// =======================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
