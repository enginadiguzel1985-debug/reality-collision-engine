import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/**
 * HEALTH CHECK
 */
app.get("/", (req, res) => {
  res.json({ status: "OK", service: "Reality Collision Engine" });
});

/**
 * SUBMIT IDEA — BULLETPROOF VERSION
 */
app.post("/submit-idea", async (req, res) => {
  const { idea } = req.body;

  // HARD FAIL-SAFE RESPONSE (ASLA BOŞ DÖNMEZ)
  const fallbackAnalysis = `
Assumption & Risk Analysis:

• Demand is unproven and must be validated with real foot traffic data.
• Shopping mall rental costs may significantly reduce margins.
• Seasonality risk: lemonade demand may fluctuate.
• Operational complexity (staffing, permits, sourcing) is often underestimated.

This is a preliminary reality check.
`;

  try {
    // ŞU ANDA AI'YI BİLEREK DEVRE DIŞI BIRAKIYORUZ
    // ÜRÜN STABİL OLSUN DİYE

    return res.json({
      analysis: fallbackAnalysis,
      source: "fallback",
      canContinueToRealityCollision: true,
    });
  } catch (err) {
    return res.json({
      analysis: fallbackAnalysis,
      source: "fallback-error",
      canContinueToRealityCollision: true,
    });
  }
});

/**
 * REALITY COLLISION — PLACEHOLDER
 */
app.post("/reality-collision", async (req, res) => {
  return res.json({
    result: `
Reality Collision Result:

• Your idea faces real-world friction in cost, demand, and scalability.
• Small-scale pilot testing is strongly recommended.
• Consider alternative locations or lower fixed-cost setups.
`,
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("✅ Server running on port", PORT);
});
