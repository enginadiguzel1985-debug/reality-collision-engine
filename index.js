import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

/* =========================
   🔒 ENV CHECK (HARD FAIL)
========================= */
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Deploy aborted.");
}

/* =========================
   🔒 GEMINI INIT
========================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* =========================
   🔒 MASTER PROMPTS
   (Birebir, kısaltma yok)
========================= */

// DECISION STRESS TEST PROMPT
const DECISION_STRESS_TEST_PROMPT = `
[PASTE HERE YOUR FULL ORIGINAL DECISION STRESS TEST MASTER PROMPT
WORD FOR WORD – NO SHORTENING – NO EDITING]
`;

// REALITY COLLISION PROMPT
const REALITY_COLLISION_PROMPT = `
[PASTE HERE YOUR FULL ORIGINAL REALITY COLLISION MASTER PROMPT
WORD FOR WORD – NO SHORTENING – NO EDITING]
`;

/* =========================
   🧠 AI CALL WRAPPER
========================= */
async function runGemini(prompt, idea) {
  try {
    const result = await model.generateContent(`${prompt}\n\nIdea:\n${idea}`);
    const response = result.response.text();

    if (!response || response.trim().length === 0) {
      throw new Error("Empty AI response");
    }

    return {
      success: true,
      content: response
    };
  } catch (err) {
    console.error("AI ERROR:", err.message);

    return {
      success: false,
      error: "AI processing failed",
      fallback_used: true
    };
  }
}

/* =========================
   🚀 ENDPOINTS
========================= */

app.post("/decision-stress-test", async (req, res) => {
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: "Idea is required" });

  const result = await runGemini(DECISION_STRESS_TEST_PROMPT, idea);

  if (!result.success) {
    return res.status(500).json({
      error: "AI temporarily unavailable. Conservative fallback analysis shown."
    });
  }

  res.json({ result: result.content });
});

app.post("/reality-collision", async (req, res) => {
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: "Idea is required" });

  const result = await runGemini(REALITY_COLLISION_PROMPT, idea);

  if (!result.success) {
    return res.status(500).json({
      error: "AI temporarily unavailable. Conservative fallback analysis shown."
    });
  }

  res.json({ result: result.content });
});

/* =========================
   🌐 SERVER
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
