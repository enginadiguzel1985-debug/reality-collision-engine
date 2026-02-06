import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

// GEMINI API KEY from environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Decision Stress Test endpoint
app.post("/decision-stress-test", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a brutally honest business reality checker.
Destroy weak assumptions. Be direct.

Idea:
${idea}

Follow these mandatory principles exactly:
- Only use user's input, no external data
- Identify implicit and explicit assumptions
- Highlight structural pressures
- Detect psychological biases: overconfidence, oversimplification, control illusion, survivorship bias, "good product sells itself"
- Use cold, direct, confrontational language
- Output structure: Summary → Key Assumptions → Structural Pressure Points → Bias Analysis → Breakage Scenarios → Conditional Applicability → Clear Verdict
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ result: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// Reality Collision endpoint
app.post("/reality-collision", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a Reality Collision Engine.
Operate only under the assumption that the Decision Stress Test allowed proceeding.
Be cold, direct, unforgiving. No guidance, no motivation, no alternatives.

Idea:
${idea}

Mandatory domains:
1) Attention & Visibility
2) Purchase Threshold
3) Competitive Indifference
4) Distribution Friction
5) Time & Endurance

Output strictly:
A. Reality Collision Summary
B. Inevitable Market Pressures
C. Tolerance Threshold
D. Endurance Scenario
E. Final Reality Verdict (choose one):
   - "This idea is not tolerable under current world conditions."
   - "This idea is tolerable only if the following conditions are consciously accepted."
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ result: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// Health check
app.get("/healthz", (req, res) => {
  res.json({ status: "ok", message: "Reality engine running!" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI engine running on port ${port}`));
