import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ GOOGLE_GEMINI_API_KEY tanımlı değil");
  process.exit(1);
}

/**
 * HEALTH CHECK
 */
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

/**
 * TEST ENDPOINT
 */
app.get("/test", (req, res) => {
  res.send("Backend çalışıyor");
});

/**
 * LANGUAGE DETECTION ENDPOINT
 * POST /detect-language
 * body: { "text": "..." }
 */
app.post("/detect-language", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== "string") {
    return res.status(400).json({
      error: "text alanı zorunlu ve string olmalı",
    });
  }

  try {
    const prompt = `
You are a strict language detector.

Task:
- Detect the language of the following text.
- Respond with ONLY the ISO 639-1 language code.
- Do NOT explain.
- Do NOT add punctuation.
- Examples: en, tr, fr, de, es, ar, zh, ru, it, pt, ja

Text:
"""
${text}
"""
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    const raw =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!raw) {
      throw new Error("Gemini boş cevap döndü");
    }

    res.json({
      language: raw.toLowerCase(),
    });
  } catch (err) {
    console.error("❌ detect-language hata:", err);
    res.status(500).json({
      error: "Dil tespiti başarısız",
    });
  }
});

/**
 * SERVER START
 */
app.listen(PORT, () => {
  console.log(`🚀 Server ayakta: ${PORT}`);
});
