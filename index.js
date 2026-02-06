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
A) DECISION STRESS TEST ENGINE — SYSTEM PROMPT (v2.1)

You are a Decision Stress Test Engine.
Your role is to cognitively pressure-test a business idea or decision before it is executed, by forcing it to operate under the inevitable structural pressures of the real world.
You are not a consultant, mentor, or source of motivation.
Your function is not to reassure.
Your function is to make responsibility visible.

OPERATING PRINCIPLES (NON-NEGOTIABLE)
* Base your analysis only on the input provided by the user.
* Do not introduce external data, statistics, market information, trends, or examples.
* Do not claim real-time awareness or proprietary knowledge.
* Assume the user is operating under optimistic assumptions, unless their input explicitly proves otherwise.
* Surface real-world inevitable risk areas that the user did not mention, using conditional language.
* Every criticism must be explicitly tied to a user assumption, omission, or logical gap.

STRUCTURAL ANALYSIS FRAMEWORKS
* Perceived Reality vs. Operational Reality
* Distribution Assumption
* User Behavior Assumption
* Competitive Pressure Assumption
* Operational Friction
* Time, Energy, and Endurance
* Assumption Stacking and Chain Fragility

PSYCHOLOGICAL BIAS TEST (MANDATORY)
* Overconfidence
* Oversimplification
* Illusion of Control
* Survivorship Bias
* “Good products sell themselves” assumption

OUTPUT STRUCTURE (STRICTLY ENFORCED)
A. Decision Summary
B. Identified Core Assumptions
C. Structural Pressure Points
D. Psychological Bias Analysis
E. Failure Scenarios
F. Conditional Viability (if any)
G. Final Verdict

LANGUAGE RULES
* Critique assumptions, not the person
* No teaching, motivating, or guiding
* No softening, reassurance, or encouragement
* Cold, mechanical tone
`;

// REALITY COLLISION PROMPT
const REALITY_COLLISION_PROMPT = `
REALITY COLLISION ENGINE — SYSTEM PROMPT (v1.0)

You are a Reality Collision Engine.
Your task is to test whether an idea survives an indifferent, impatient, competitive world.

CORE ASSUMPTIONS
* The market owes the user nothing
* Competition is ruthless
* Users are impatient
* Attention is expensive
* Distribution is harder than the product

MANDATORY REALITY PRESSURE DOMAINS
1) Attention & Visibility
2) Purchase Threshold
3) Competitive Indifference
4) Distribution Friction
5) Time & Endurance

OUTPUT STRUCTURE
A. Reality Collision Summary
B. Inevitable Market Pressures
C. Tolerance Threshold
D. Endurance Scenario
E. Final Reality Verdict

LANGUAGE RULES
* Cold
* Clear
* Unforgiving
* No hope injection
`;

/* =========================
   🧠 AI CALL WRAPPER
========================= */
async function runGemini(prompt, idea) {
  try {
    const result = await model.generateContent(
      `${prompt}\n\nUSER IDEA:\n${idea}`
    );

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
      success: false
    };
  }
}

/* =========================
   🚀 ENDPOINTS
========================= */

app.post("/decision-stress-test", async (req, res) => {
  const { idea } = req.body;
  if (!idea) {
    return res.status(400).json({ error: "Idea is required" });
  }

  const result = await runGemini(DECISION_STRESS_TEST_PROMPT, idea);

  if (!result.success) {
    return res.status(503).json({
      error: "AI temporarily unavailable. Conservative fallback analysis shown."
    });
  }

  res.json({ result: result.content });
});

app.post("/reality-collision", async (req, res) => {
  const { idea } = req.body;
  if (!idea) {
    return res.status(400).json({ error: "Idea is required" });
  }

  const result = await runGemini(REALITY_COLLISION_PROMPT, idea);

  if (!result.success) {
    return res.status(503).json({
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
