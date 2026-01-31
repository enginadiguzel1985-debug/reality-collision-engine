import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/**
 * Health check
 */
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Feasibility Engine backend running." });
});

/**
 * MAIN ENDPOINT
 * Shopify Custom Liquid -> buraya POST atacak
 */
app.post("/submit-idea", async (req, res) => {
  try {
    const { idea, page_handle } = req.body;

    if (!idea) {
      return res.status(400).json({ ok: false, error: "IDEA_REQUIRED" });
    }

    // 1️⃣ Gemini API çağrısı
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are a brutal business reality auditor.
Analyze this idea and point out:
- false assumptions
- major risks
- what will most likely fail
- one concrete improvement suggestion

Business idea:
${idea}
                  `
                }
              ]
            }
          ]
        })
      }
    );

    const geminiData = await geminiResponse.json();

    const output =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No analysis generated.";

    // 2️⃣ Shopify Metafield yazma
    const shopifyRes = await fetch(
      `https://${process.env.SHOPIFY_STORE}/admin/api/2024-01/pages/${process.env.SHOPIFY_PAGE_ID}/metafields.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          metafield: {
            namespace: "feasibility",
            key: "step1_text",
            type: "multi_line_text_field",
            value: output
          }
        })
      }
    );

    if (!shopifyRes.ok) {
      const err = await shopifyRes.text();
      return res.status(500).json({ ok: false, error: err });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

app.listen(process.env.PORT || 10000, () =>
  console.log("Server running")
);
