import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const API_KEY = "AIzaSyDMUS6O7EJfEo53Mdwj8TyqFstMXGY3flo"; // ← Buraya Google Cloud API Key'i yapıştır

app.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ ok: false, error: "TEXT_AND_TARGET_REQUIRED" });
    }

    const response = await fetch(
      `https://translation.googleapis.com/v3/projects/gen-lang-client-0366781740/locations/global:translateText?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [text],
          targetLanguageCode: targetLanguage,
          mimeType: "text/plain",
        }),
      }
    );

    const data = await response.json();
    if (!data.translations || data.translations.length === 0) {
      return res.status(422).json({ ok: false, error: "TRANSLATION_FAILED" });
    }

    return res.json({
      ok: true,
      translatedText: data.translations[0].translatedText,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: "INTERNAL_ERROR" });
  }
});

app.listen(process.env.PORT || 10000, () => console.log("Server running on port 10000"));
