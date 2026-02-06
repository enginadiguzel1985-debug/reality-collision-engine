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

/* 
   ⚠️ MODEL ADI: Buraya geçerli model adını koyacağız.
   Örneğin: "gemini-1.5" veya "default". 
   Önce /list-models endpoint’i ile bakacağız.
*/
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* =========================
   🔒 MASTER PROMPTS
========================= */

// DECISION STRESS TEST PROMPT
const DECISION_STRESS_TEST_PROMPT = `
[A) DECISION STRESS TEST ENGINE — SYSTEM PROMPT (v2.1)
... (senin daha önce verdiğin tam prompt buraya gelecek)
USER INPUT:
{{USER_INPUT}}
]
`;

// REALITY COLLISION PROMPT
const REALITY_COLLISION_PROMPT = `
[REALITY COLLISION ENGINE — SYSTEM PROMPT (v1.0)
... (senin daha önce verdiğin tam prompt buraya gelecek)
USER INPUT:
{{USER_INPUT}}
]
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
   🔍 HEALTH CHECK
========================= */
app.get("/gemini-health-check", async (req, res) => {
  try {
    const result = await model.generateContent("Say hello");
    res.json({ success: true });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.json({ success: false, error: "Gemini did not respond" });
  }
});

/* =========================
   📄 LIST MODELS
========================= */
app.get("/list-models", async (req, res) => {
  try {
    const models = await genAI.listModels();
    res.json({ success: true, models });
  } catch (err) {
    console.error("ListModels failed:", err.message);
    res.json({ success: false, error: err.message });
  }
});

/* =========================
   🌐 SERVER
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
