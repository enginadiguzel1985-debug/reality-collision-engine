import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

/* ================================
   CONFIG
================================ */
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;
const SHOPIFY_SHOP = process.env.SHOPIFY_SHOP; // feasibility-engine
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const PAGE_ID = process.env.TEST_YOUR_IDEA_PAGE_ID; // 102557548599

/* ================================
   HELPERS
================================ */
async function callGemini(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
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

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
}

async function writePageMetafield(key, value) {
  const res = await fetch(
    `https://${SHOPIFY_SHOP}.myshopify.com/admin/api/2024-01/pages/${PAGE_ID}/metafields.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ADMIN_TOKEN,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        metafield: {
          namespace: "feasibility",
          key,
          type: "multi_line_text_field",
          value
        }
      })
    }
  );

  return res.ok;
}

/* ================================
   HEALTH
================================ */
app.get("/", (_, res) => {
  res.json({ ok: true, message: "Feasibility Engine backend running." });
});

/* ================================
   STEP 1 – ASSUMPTION ANALYSIS
================================ */
app.post("/submit-idea", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
You are a brutally honest business analyst.

Analyze the following business idea.
Focus on:
- Unrealistic assumptions
- Fatal flaws
- Market risks
- Why this idea is likely to fail

Be direct, critical, and unemotional.

Business idea:
${idea}
`;

    const output = await callGemini(prompt);
    await writePageMetafield("step1_text", output);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

/* ================================
   STEP 2 – REALITY COLLISION
================================ */
app.post("/reality-test", async (req, res) => {
  try {
    const { idea } = req.body;

    const prompt = `
You are a reality collision engine.

Take this business idea and collide it with real-world constraints:
- Money
- Human behavior
- Competition
- Execution friction
- Timing

Explain where reality will break this idea.

Be harsh but accurate.

Business idea:
${idea}
`;

    const output = await callGemini(prompt);
    await writePageMetafield("step2_text", output);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
});

/* ================================
   START
================================ */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
