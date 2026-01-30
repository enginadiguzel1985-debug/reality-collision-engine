import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

/* ===============================
   ENV KONTROL (kritik)
================================ */
const {
  SHOPIFY_CLIENT_ID,
  SHOPIFY_CLIENT_SECRET,
  SHOPIFY_SCOPES,
  SHOPIFY_REDIRECT_URI,
} = process.env;

if (
  !SHOPIFY_CLIENT_ID ||
  !SHOPIFY_CLIENT_SECRET ||
  !SHOPIFY_SCOPES ||
  !SHOPIFY_REDIRECT_URI
) {
  console.error("❌ Shopify ENV değişkenleri eksik");
  process.exit(1);
}

/* ===============================
   HEALTH & TEST
================================ */
app.get("/", (req, res) => {
  res.send("Backend çalışıyor");
});

app.get("/test", (req, res) => {
  res.send("Backend çalışıyor");
});

/* ===============================
   1️⃣ SHOPIFY AUTH START
================================ */
app.get("/auth", (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("❌ shop parametresi yok");
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = SHOPIFY_REDIRECT_URI;

  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_CLIENT_ID}` +
    `&scope=${SHOPIFY_SCOPES}` +
    `&redirect_uri=${redirectUri}` +
    `&state=${state}`;

  console.log("➡️ Shopify OAuth başlatıldı:", installUrl);
  res.redirect(installUrl);
});

/* ===============================
   2️⃣ SHOPIFY CALLBACK
================================ */
app.get("/auth/callback", async (req, res) => {
  const { shop, code } = req.query;

  if (!shop || !code) {
    return res.status(400).send("❌ shop veya code eksik");
  }

  const tokenUrl = `https://${shop}/admin/oauth/access_token`;

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: SHOPIFY_CLIENT_ID,
        client_secret: SHOPIFY_CLIENT_SECRET,
        code,
      }),
    });

    const data = await response.json();

    console.log("✅ ACCESS TOKEN ALINDI:");
    console.log("SHOP:", shop);
    console.log("TOKEN:", data.access_token);

    res.send("OAuth tamamlandı. Console loglarını kontrol et.");
  } catch (err) {
    console.error("❌ OAuth hata:", err);
    res.status(500).send("OAuth başarısız");
  }
});

/* ===============================
   SERVER START
================================ */
app.listen(PORT, () => {
  console.log(`🚀 Server ayakta: ${PORT}`);
});
