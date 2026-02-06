import express from "express";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/decision-stress-test", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
${decisionStressTestPrompt}

User Idea:
${idea}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ result: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

app.post("/reality-collision", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
${realityCollisionPrompt}

User Idea:
${idea}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({ result: text });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`AI engine running on port ${PORT}`));
