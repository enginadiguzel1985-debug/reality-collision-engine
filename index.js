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

    if (!idea) {
      return res.status(400).json({ error: "Idea is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const prompt = `
You are a brutally honest business reality checker.
Destroy weak assumptions. Be direct.

Idea:
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

app.listen(3000, () => {
  console.log("AI engine running on port 3000");
});
