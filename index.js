import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import querystring from "querystring";

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
app.options("*", cors());

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 10000;
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES;
const SHOPIFY_REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI;

/* ===============================
   SHOPIFY OAUTH START
================================ */
app.get("/auth", (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send("Missing shop parameter");
  const redirect = `https://${shop}/admin/oauth/authorize?${querystring.stringify({
    client_id: SHOPIFY_CLIENT_ID,
    scope: SHOPIFY_SCOPES,
    redirect_uri: SHOPIFY_REDIRECT_URI,
    state: "nonce123", // basit nonce, production’da random olmalı
    grant_options: ["per-user"]
  })}`;
  res.redirect(redirect);
});

/* ===============================
   SHOPIFY OAUTH CALLBACK
================================ */
app.get("/auth/callback", async (req, res) => {
  const { shop, code } = req.query;
  if (!shop || !code) return res.status(400).send("Missing parameters");

  const tokenResp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      code
    })
  });
  const data = await tokenResp.json();
  const accessToken = data.access_token;

  // Ekrana basit mesaj
  res.send("Shopify OAuth tamamlandı, access token alındı.");

  // Burada accessToken’ı güvenli yerde sakla
});

/* ===============================
   METAFIELD WRITE (Shopify Admin API)
================================ */
app.post("/write-metafield", async (req, res) => {
  try {
    const { shop, access_token, namespace, key, value, value_type } = req.body;

    const resp = await fetch(`https://${shop}/admin/api/2026-01/metafields.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": access_token
      },
      body: JSON.stringify({
        metafield: {
          namespace,
          key,
          value,
          type: value_type || "single_line_text_field"
        }
      })
    });
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Metafield yazılamadı" });
  }
});

/* ===============================
   SERVER
================================ */
app.listen(PORT, () => console.log("Server running on port", PORT));
