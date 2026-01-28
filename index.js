import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());

app.use(
  cors({
    origin: [
      "https://feasibilityengine.com",
      "https://www.feasibilityengine.com"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
  })
);

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

/* =========================================================
   🔒 BAĞLAYICI SİSTEM TALİMATLARI
========================================================= */
const SYSTEM_CONSTRAINTS = `
BU TALİMATLAR BAĞLAYICIDIR.
Bu çerçevenin dışına çıkan cevap GEÇERSİZDİR.

- Yumuşatma yok
- Motive etme yok
- Yol gösterme yok
- Alternatif üretme yok
- Öğretmenlik yok

Amaç:
Kullanıcının fark etmediği gerçekleri görünür kılmak.
`;

/* =========================================================
   DECISION STRESS TEST ENGINE — v2.1
========================================================= */
const DECISION_STRESS_TEST_PROMPT = `
${SYSTEM_CONSTRAINTS}

[DECISION STRESS TEST ENGINE — v2.1]

Bu analiz bir eleme mekanizması değildir.
Amaç fikri öldürmek ya da yaşatmak değil,
kullanıcının fark etmediği varsayımları
acımasız biçimde görünür kılmaktır.

ROLÜN:
Sen bir karar stres analiz motorusun.

ANALİZ ÇERÇEVESİ:
A. Varsayımlar
B. Kör Noktalar
C. Aşırı İyimserlik Alanları
D. Görmezden Gelinen Riskler

KAPANIŞ:
Kullanıcıya şunu açıkça sor:
“Bu fikir için gerçeklik testine geçmek istiyor musun?”

Sunulacak seçenekler:
1. Aynı metinle devam et
2. Metni revize edip detaylandırarak devam et

Dil:
Soğuk, net, yargısız.

KULLANICI GİRDİSİ:
{{USER_INPUT}}
`;

/* =========================================================
   REALITY COLLISION ENGINE — v1.0
========================================================= */
const REALITY_COLLISION_PROMPT = `
${SYSTEM_CONSTRAINTS}

[REALITY COLLISION ENGINE — v1.0]

Bu analiz yalnızca
kullanıcının bilinçli olarak
gerçeklik testi talep etmesi durumunda yapılır.

ROLÜN:
Gerçek dünyanın yapısal baskılarını
fikrin üzerine çarpıştıran bir motordur.

ANALİZ ÇERÇEVESİ:
A. Yapısal Gerçeklik Katmanları
B. Aynı Anda Çalışması Gereken Minimum Koşullar
C. Sistemik Sıkışma Noktaları
D. Yanılsama Riskleri
E. Kırılma Senaryoları
F. Koşullu Hayatta Kalabilirlik

SONUÇ:
Fikrin gerçek dünyada hangi şartlar altında
ayakta kalabileceğini ya da kalamayacağını netleştir.

Dil:
Soğuk, yapısal, tarafsız.

KULLANICI GİRDİSİ:
{{USER_INPUT}}
`;

/* =========================================================
   GEMINI CALL
========================================================= */
async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No output";
}

/* =========================================================
   ROUTES
========================================================= */
app.post("/decision-stress-test", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const prompt = DECISION_STRESS_TEST_PROMPT.replace(
      "{{USER_INPUT}}",
      text
    );
    const result = await callGemini(prompt);

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

app.post("/reality-collision", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const prompt = REALITY_COLLISION_PROMPT.replace(
      "{{USER_INPUT}}",
      text
    );
    const result = await callGemini(prompt);

    res.json({ result });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

/* =========================================================
   SERVER
========================================================= */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
