import express from "express";
import cors from "cors";
import { TranslationServiceClient } from "@google-cloud/translate";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * Google Translate Client (v3)
 */
const translateClient = new TranslationServiceClient();

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.json({ status: "ok", service: "reality-collision-engine" });
});

/**
 * Detect language endpoint
 * POST /detect-language
 * Body: { "text": "Hello world" }
 */
app.post("/detect-language", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        ok: false,
        error: "Text is required and must be a string"
      });
    }

    const [response] = await translateClient.detectLanguage({
      parent: `projects/${process.env.GOOGLE_PROJECT_ID}/locations/global`,
      content: text
    });

    const detection = response.languages[0];

    res.json({
      ok: true,
      language: detection.languageCode,
      confidence: detection.confidence
    });
  } catch (err) {
    console.error("Detect language error:", err);
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

/**
 * Port binding (Render compatible)
 */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
