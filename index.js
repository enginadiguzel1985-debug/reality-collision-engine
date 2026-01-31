import express from "express";
import bodyParser from "body-parser";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";

const app = express();
app.use(bodyParser.json());

const translate = new Translate(); // default credentials

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "reality-collision-engine"
  });
});

// Language detection
app.post("/detect-language", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        ok: false,
        error: "text is required"
      });
    }

    const [detection] = await translate.detect(text);

    res.json({
      ok: true,
      language: detection.language
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

// 🔥 TRANSLATE – CORE ENDPOINT
app.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        ok: false,
        error: "text and targetLanguage are required"
      });
    }

    const [translation] = await translate.translate(text, targetLanguage);

    res.json({
      ok: true,
      translatedText: translation
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
