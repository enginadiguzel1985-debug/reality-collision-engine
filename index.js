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
    allowedHeaders: ["Content-Type"],
    credentials: false
  })
);

// 🔴 PRE-FLIGHT FIX
app.options("*", cors());

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES;

// ⚠️ Burada kaydedilmiş token
let SHOPIFY_ACCESS_TOKEN = "";  

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => res.send("OK"));
app.get("/test", (req, res) => res.send("Backend çalışıyor"));

/* ===============================
   SHOPIFY OAUTH CALLBACK
================================ */
app.get("/auth/callback", async (req, res) => {
  const { code, shop } = req.query;
  if (!code || !shop) return res.status(400).send("Eksik parametre");

  try {
    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code
      })
    });

    const data = await response.json();
    SHOPIFY_ACCESS_TOKEN = data.access_token;
    console.log("SHOPIFY ACCESS TOKEN:", SHOPIFY_ACCESS_TOKEN);

    res.send("Shopify OAuth tamamlandı. Token konsola yazıldı.");
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth hatası");
  }
});

/* ===============================
   WRITE METAFIELD
================================ */
app.post("/write-metafield", async (req, res) => {
  if (!SHOPIFY_ACCESS_TOKEN) return res.status(400).json({ error: "OAuth tamamlanmadı" });

  const { productId, namespace, key, value, type } = req.body;
  if (!productId || !namespace || !key || !value || !type) {
    return res.status(400).json({ error: "Eksik parametre" });
  }

  try {
    const response = await fetch(
      `https://${req.headers.shop}/admin/api/2026-01/products/${productId}/metafields.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN
        },
        body: JSON.stringify({
          metafield: { namespace, key, value, type }
        })
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Metafield yazma hatası" });
  }
});

/* ===============================
   GEMINI CALL
================================ */
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

/* ===============================
   ROUTES
================================ */
app.post("/decision-stress-test", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const prompt = text; // prompt hazır
    const result = await callGemini(prompt);

    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/reality-collision", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });

    const prompt = text;
    const result = await callGemini(prompt);

    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ===============================
   SERVER
================================ */
app.listen(PORT, () => console.log("Server running on port", PORT));
