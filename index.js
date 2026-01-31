import express from "express";
import cors from "cors";
import { Translate } from "@google-cloud/translate/build/src/v2/index.js";

const app = express();
app.use(cors());
app.use(express.json());

// ---------- GOOGLE CREDENTIALS (ENV'DEN) ----------
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  console.error("❌ GOOGLE_APPLICATION_CREDENTIALS_JSON ENV missing");
  process.exit(1);
}

let googleCredentials;
try {
  googleCredentials = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
  );
} catch (err) {
  console.error("❌ Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON");
  process.exit(1);
}

// ---------- TRANSLATE CLIENT ----------
const translate = new Translate({
  credentials: {
    client_email: googleCredentials.client_email,
    private_key: googleCredentials.private_key,
  },
  projectId: googleCredentials.project_id,
});

// ---------- HEALTH CHECK ----------
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "reality-collision-engine",
  });
});

// ---------- DETECT LANGUAGE ----------
app.post("/detect-language", async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string") {
      return res.status(400).json({
        ok: false,
        error: "text field is required",
      });
    }

    const [detection] = await translate.detect(text);

    const language = Array.isArray(detection)
      ? detection[0].language
      : detection.language;

    res.json({
      ok: true,
      language,
    });
  } catch (err) {
    console.error("❌ detect-language error:", err);
    res.status(500).json({
      ok: false,
      error: "language detection failed",
    });
  }
});

// ---------- SERVER ----------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
