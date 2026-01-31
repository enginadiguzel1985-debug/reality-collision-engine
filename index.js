/**
 * Production-ready language detection API
 * Google Cloud Translation v3
 */

const express = require("express");
const { TranslationServiceClient } = require("@google-cloud/translate").v3;

const app = express();
app.use(express.json());

/**
 * Google Auth (Service Account JSON)
 */
const translationClient = new TranslationServiceClient({
  keyFilename:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    "backend/keys/google-translate.json",
});

/**
 * POST /detect-language
 * Body: { "text": "Hello world" }
 */
app.post("/detect-language", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        success: false,
        error: "TEXT_REQUIRED",
      });
    }

    const projectId = await translationClient.getProjectId();

    const request = {
      parent: `projects/${projectId}/locations/global`,
      content: text,
    };

    const [response] = await translationClient.detectLanguage(request);

    if (!response.languages || response.languages.length === 0) {
      return res.status(422).json({
        success: false,
        error: "LANGUAGE_NOT_DETECTED",
      });
    }

    const best = response.languages[0];

    return res.json({
      success: true,
      language: best.languageCode,
      confidence: best.confidence,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "DETECTION_FAILED",
    });
  }
});

/**
 * Server start
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
