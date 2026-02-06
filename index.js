import express from "express";
import { VertexAI } from "@google-cloud/vertexai";

const app = express();
app.use(express.json());

// ENV zorunlu kontrol (master prompt kilidi)
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw new Error("GOOGLE_APPLICATION_CREDENTIALS is missing. Deploy aborted.");
}

const vertexAI = new VertexAI({
  project: "gen-lang-client-0366781740",
  location: "us-central1",
});

const model = vertexAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

/**
 * Health check
 */
app.get("/gemini-health-check", async (req, res) => {
  try {
    const result = await model.generateContent("Health check ping");
    res.json({
      status: "ok",
      response: result.response.text(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * List models sanity check
 */
app.get("/list-models", async (req, res) => {
  res.json({
    model: "gemini-1.5-flash",
    auth: "service-account",
    provider: "vertex-ai",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
