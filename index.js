import express from "express";
import fetch from "node-fetch";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 10000;

/* ======================
   ENV VARIABLES
====================== */
const {
  SHOPIFY_CLIENT_ID,
  SHOPIFY_CLIENT_SECRET,
  SHOPIFY_SCOPES,
  SHOPIFY_REDIRECT_URI,
  SHOPIFY_ACCESS_TOKEN,
  SHOPIFY_SHOP
} = process.env;

/* ======================
   BASIC HEALTH
====================== */
app.get("/", (req, res) => {
  res.send("Backend çalışıyor");
});

app.get("/test", (req, res) => {
  res.send("Backend test OK");
});

/* ======================
   SHOPIFY OAUTH START
====================== */
app.get("/auth", (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send("Shop parametresi yok");

  const state = crypto.randomBytes(16).toString("hex");

  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_CLIENT_ID}` +
    `&scope=${SHOPIFY_SCOPES}` +
    `&redirect_uri=${SHOPIFY_REDIRECT_URI}` +
    `&state=${state}`;

  console.log("➡️ Shopify OAuth başlatıldı:", installUrl);
  res.redirect(installUrl);
});

/* ======================
   SHOPIFY OAUTH CALLBACK
====================== */
app.get("/auth/callback", async (req, res) => {
  const { shop, code } = req.query;

  const tokenUrl = `https://${shop}/admin/oauth/access_token`;

  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      code
    })
  });

  const data = await response.json();

  console.log("✅ ACCESS TOKEN ALINDI:");
  console.log("SHOP:", shop);
  console.log("TOKEN:", data.access_token);

  res.send("OAuth tamamlandı. Console loglarını kontrol et.");
});

/* ======================
   SHOP.JSON TEST ENDPOINT
====================== */
app.get("/shop-test", async (req, res) => {
  try {
    const url = `https://${SHOPIFY_SHOP}/admin/api/2024-01/shop.json`;

    const response = await fetch(url, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json"
      }
    });

    const text = await response.text();

    // JSON parse edilemezse net görelim diye
    try {
      const json = JSON.parse(text);
      res.json(json);
    } catch {
      res.status(500).send(text);
    }

  } catch (err) {
    res.status(500).send(err.message);
  }
});

/* ======================
   START SERVER
====================== */
app.listen(PORT, () => {
  console.log(`🚀 Server ayakta: ${PORT}`);
});
