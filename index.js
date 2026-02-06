import express from "express";
import bodyParser from "body-parser";
import * as genAI from "@google/generative-ai"; // <-- bu şekilde import etmeliyiz

const app = express();
app.use(bodyParser.json());

// GEMINI_API_KEY Render ortam değişkeninden alınıyor
const client = new genAI.Generative({ apiKey: process.env.GEMINI_API_KEY });

// Kullanacağımız model
const MODEL_NAME = "gemini-1.5-flash"; // mevcut model adı

// Health check endpoint
app.get("/gemini-health-check", async (req, res) => {
  try {
    const result = await client.generateContent(MODEL_NAME, {
      prompt: "Say hello",
    });
    res.json({ success: true, result });
  } catch (err) {
    console.error("Health check failed:", err.message);
    res.json({ success: false, error: "Gemini did not respond" });
  }
});

// Decision-stress-test endpoint
app.post("/decision-stress-test", async (req, res) => {
  const idea = req.body.idea;
  if (!idea) return res.status(400).json({ error: "Missing idea in request body" });

  try {
    const response = await client.generateContent(MODEL_NAME, {
      prompt: `Analyze the following idea and provide decision-stress insights:\n${idea}`,
    });
    res.json({ analysis: response });
  } catch (err) {
    console.error("AI ERROR:", err.message);
    res.json({ error: "AI temporarily unavailable. Conservative fallback analysis shown." });
  }
});

// List models endpoint
app.get("/list-models", async (req, res) => {
  try {
    const models = await client.listModels();
    res.json({ success: true, models });
  } catch (err) {
    console.error("ListModels failed:", err.message);
    res.json({ success: false, error: err.message });
  }
});

// Port ayarı
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
