import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import {TextGenerationModel, GoogleAuth} from "@google-ai/generative";

// JSON key’in path’i
const KEY_PATH = path.join(process.cwd(), "service-account.json"); // Render'e upload ettiğin JSON key
process.env.GOOGLE_APPLICATION_CREDENTIALS = KEY_PATH;

const app = express();
app.use(cors());
app.use(express.json());

// Generative AI client
const model = new TextGenerationModel({
  model: "models/text-bison-001", // Gemini 2.5 Flash modeli, text tabanlı
});

// Helper function
async function callGemini(input, previousResult = "") {
  try {
    const response = await model.generateText({
      prompt: `${previousResult}\n\nUser idea: ${input}`,
      temperature: 0.7,
      maxOutputTokens: 500,
    });
    return response.candidates[0].content;
  } catch (error) {
    console.error("Gemini call error:", error);
    throw error;
  }
}

// Routes
app.get("/healthz", (req, res) => {
  res.json({ status: "ok", message: "Reality engine running!" });
});

app.post("/decision-stress-test", async (req, res) => {
  const { idea } = req.body;
  try {
    const prediction = await callGemini(idea);
    res.json({ result: prediction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/reality-collision", async (req, res) => {
  const { refined_idea, previous_result } = req.body;
  try {
    const prediction = await callGemini(refined_idea, previous_result);
    res.json({ result: prediction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
