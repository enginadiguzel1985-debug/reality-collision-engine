import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(express.json());
app.use(cors());

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 10000;

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES;

let SHOPIFY_ACCESS_TOKEN = "";
let SHOP_DOMAIN = "";

/* ===============================
   HEALTH
================================ */
app.get("/", (req, res) => res.send("OK"));
app.get("/test", (req, res) => res.send("Backend çalışıyor"));

/* ===============================
   SHOPIFY OAUTH START
================================ */
app.get("/auth", (req, res) => {
  const shop = req.query.shop;
  if (!shop) return res.status(400).send("shop parametresi yok");

  SHOP_DOMAIN = shop;

  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_CLIENT_ID}` +
    `&scope=${SHOPIFY_SCOPES}` +
    `&redirect_uri=${SHOPIFY_REDIRECT_URI}`;

  res.redirect(installUrl);
});

/* ===============================
   SHOPIFY OAUTH CALLBACK
================================ */
app.get("/auth/callback", async (req, res) => {
  const { code, shop } = req.query;
  if (!code || !shop) return res.status(400).send("Eksik parametre");

  try {
    const response = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: SHOPIFY_CLIENT_ID,
          client_secret: SHOPIFY_CLIENT_SECRET,
          code
        })
      }
    );

    const data = await response.json();
    SHOPIFY_ACCESS_TOKEN = data.access_token;

    console.log("✅ SHOPIFY TOKEN:", SHOPIFY_ACCESS_TOKEN);

    res.send("OAuth tamamlandı. Token alındı.");
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth hatası");
  }
});

/* ===============================
   WRITE METAFIELD
================================ */
app.post("/write-metafield", async (req, res) => {
  if (!SHOPIFY_ACCESS_TOKEN) {
    return res.status(400).json({ error: "OAuth yapılmadı" });
  }

  const { productId, namespace, key, value, type } = req.body;

  try {
    const response = await fetch(
      `https://${SHOP_DOMAIN}/admin/api/2026-01/products/${productId}/metafields.json`,
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
    res.status(500).json({ error: "Metafield hatası" });
  }
});

/* ===============================
   SERVER
================================ */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
