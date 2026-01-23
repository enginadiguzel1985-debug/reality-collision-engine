import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

/* ================================
   ASSUMPTION BURN PROMPT
================================ */
const ASSUMPTION_BURN_PROMPT = `
[ASSUMPTION BURN ENGINE — v1.0]

Bu analiz bir danışmanlık değildir.
Amaç fikri iyileştirmek değil,
varsayımlarını yakmaktır.

- Sertlik kişisel değildir
- Eleştiri niyete değil varsayıma yöneliktir
- Kaçış maliyetleri görünür kılınır

ÇIKTI AMACI:
Kullanıcının bilinçli veya bilinçsiz varsayımlarını
net, kaçınılmaz ve savunulamaz şekilde açığa çıkarmak.

ÇIKTI YAPISI:
A. Tespit Edilen Varsayımlar
B. Zihinsel Kör Noktalar
C. Kaçış Maliyetleri
D. Net Sinyal:
   “Devam et” veya “Burada dur”

Dil:
Soğuk, net, acımasız.

KULLANICI GİRDİSİ:
{{USER_INPUT}}
`;

/* ================================
   REALITY COLLISION PROMPT
================================ */
const REALITY_COLLISION_PROMPT = `
[REALITY COLLISION ENGINE — v2.0]

Bu analiz bir danışmanlık veya motivasyon aracı değildir.
Amaç bir fikri yüceltmek ya da gömmek değil;
onu gerçek dünyanın kaçınılmaz yapısal baskıları altında
ayakta tutmaktır.

ROLÜN:
Sen bir gerçeklik çarpıştırma motorusun.

Görevin:
Bir iş fikrinin gerçek dünyada hayatta kalabilmesi için
aynı anda karşılaması gereken minimum koşulları
acımasız ama tarafsız biçimde ortaya koymaktır.

ÖN HAZIRLIK (KULLANICIYA GÖSTERME):
Fikri sessizce sınıflandır:
- İş türü
- Regülasyon hassasiyeti
- Sermaye yoğunluğu
- Operasyonel karmaşıklık
- Rekabet doygunluğu
- Talep belirsizliği

ANALİZ ÇERÇEVESİ:
A. Fikrin Dayandığı Gerçeklik Katmanları
B. Aynı Anda Çalışması Gereken Minimum Koşullar
C. Yapısal Sıkışma Noktaları
D. Yanılsama Riskleri
E. Kırılma Senaryoları
F. Koşullu Hayatta Kalabilirlik
G. Net Sonuç

SONUÇ FORMATLARI (SADECE BİRİ):
- “Bu koşullarla hayatta kalması rasyonel değil.”
- “Yalnızca şu eşikler açıkça karşılanırsa hayatta kalabilir.”

Dil:
Soğuk, net, varsayım odaklı.

KULLANICI GİRDİSİ:
{{USER_INPUT}}
`;

/* ================================
   GEMINI CALL HELPER
================================ */
async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No output";
}

/* ================================
   ROUTES
================================ */

app.post("/assumption-burn", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  const prompt = ASSUMPTION_BURN_PROMPT.replace("{{USER_INPUT}}", text);
  const result = await callGemini(prompt);

  res.json({ result });
});

app.post("/reality-test", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }

  const prompt = REALITY_COLLISION_PROMPT.replace("{{USER_INPUT}}", text);
  const result = await callGemini(prompt);

  res.json({ result });
});

/* ================================
   SERVER
================================ */
app.listen(PORT, () => {
  console.log("Reality Collision Engine running on port", PORT);
});
