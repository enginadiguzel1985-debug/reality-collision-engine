import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

/*
  POST /submit-idea
  body:
  {
    idea: string,
    phase: "assumption" | "reality_collision"
  }
*/

app.post("/submit-idea", async (req, res) => {
  const idea = req.body.idea;
  const phase = req.body.phase || "assumption";

  if (!idea || idea.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "Idea is required"
    });
  }

  // =========================
  // 1️⃣ AI DENEMESİ
  // =========================
  try {
    const aiResult = await callAIStub(idea, phase);

    if (aiResult && aiResult.trim().length > 0) {
      return res.json({
        success: true,
        source: "ai",
        phase,
        analysis: aiResult
      });
    }

    console.log("AI returned empty response → fallback");

  } catch (err) {
    console.error("AI CALL FAILED → fallback", err.message);
  }

  // =========================
  // 2️⃣ FALLBACK (SON ÇARE)
  // =========================
  const fallback =
    phase === "reality_collision"
      ? realityFallback(idea)
      : assumptionFallback(idea);

  return res.json({
    success: true,
    source: "fallback",
    phase,
    analysis: fallback
  });
});

// =========================
// FALLBACK METİNLERİ
// =========================

function assumptionFallback(idea) {
  return `
BRUTALLY HONEST BASELINE ANALYSIS (Fallback)

Business Idea:
"${idea}"

Key Assumption:
You assume demand exists without proving it.

Reality:
Most ideas fail here.

Next Step:
Explicitly list what MUST be true for this to work.
`;
}

function realityFallback(idea) {
  return `
REALITY COLLISION (Fallback)

Idea:
"${idea}"

Reality Check:
Belief does not create customers.
Constraints do.

Question:
What real-world factor kills this idea first?
`;
}

// =========================
// AI STUB (ŞİMDİLİK)
// =========================
// Burası BİLİNÇLİ OLARAK SAHTE.
// Gemini / OpenAI buraya sonra bağlanacak.

async function callAIStub(idea, phase) {
  return null; // ❗ null → fallback tetikler
}

// =========================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
