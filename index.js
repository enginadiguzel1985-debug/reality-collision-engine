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

const PORT = process.env.PORT || 10000;
const SHOPIFY_STORE = "feasibility-engine.myshopify.com"; // mağaza domain
const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const SHOPIFY_SCOPES = process.env.SHOPIFY_SCOPES;
const SHOPIFY_REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI;

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => res.status(200).send("OK"));

/* =========================================================
   METAFIELD WRITE — NODE / SHOPIFY ADMIN API
========================================================= */
app.post("/write-metafield", async (req, res) => {
  try {
    const { productId, namespace, key, value, type } = req.body;
    if (!productId || !namespace || !key || !value || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const url = `https://${SHOPIFY_STORE}/admin/api/2026-01/products/${productId}/metafields.json`;
    const body = {
      metafield: { namespace, key, value, type }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_CLIENT_SECRET
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =========================================================
   SERVER START
========================================================= */
app.listen(PORT, () => console.log("Server running on port", PORT));
