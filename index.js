import express from "express";
import OpenAI from "@google/generative-ai";

const app = express();
app.use(express.json());

/* =========================
   🔒 ENV CHECK (HARD FAIL)
========================= */
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Deploy aborted.");
}

/* =========================
   🔒 GEMINI INIT (SDK 0.19.0 uyumlu)
========================= */
const client = new OpenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = "gemini-1.5"; // eski "flash" versiyon kaldırıldı, listModels ile doğrula

/* =========================
   🔒 MASTER PROMPTS
========================= */
const DECISION_STRESS_TEST_PROMPT = `
[A) DECISION STRESS TEST ENGINE — SYSTEM PROMPT (v2.1)
User Input: {{USER_INPUT}}
]
`;

const REALITY_COLLISION_PROMPT = `
[REALITY COLLISION ENGINE — SYSTEM PROMPT (v1.0)
User Input: {{USER_INPUT}}
]
`;

/* =========================
   🧠 AI CALL WRAPPER
========================= */
async function runGemini(prompt, idea) {
  try {
    const response = await client.responses.create({
      model: MODEL_NAME,
      input: `${prompt}\n\nIdea:\n${idea}`,
    });

    const text = response.output_text || "";

    if (!text || text.trim().length === 0) {
      throw new Error("Empty AI response");
    }

    return { success: true, content: text };
  } catch (err) {
    console.error("AI ERROR:", err.message);
    return { success: false, error: err.message, fallback_used: true };
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
    return res
      .status(500)
      .json({ error: "AI temporarily unavailable. Conservative fallback analysis shown." });
  }

  res.json({ result: result.content });
});

app.post("/reality-collision", async (req, res) => {
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: "Idea is required" });

  const result = await runGemini(REALITY_COLLISION_PROMPT, idea);
  if (!result.success) {
    return res
      .status(500)
      .json({ error: "AI temporarily unavailable. Conservative fallback analysis shown." });
  }

  res.json({ result: result.content });
});

/* =========================
   🧪 HEALTH CHECK
========================= */
app.get("/gemini-health-check", async (req, res) => {
  try {
    const response = await client.responses.create({
      model: MODEL_NAME,
      input: "Say hello",
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.json({ success: false, error: "Gemini did not respond" });
  }
});

/* =========================
   🌐 SERVER
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
