import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// === MASTER PROMPT ===
const REALITY_COLLISION_PROMPT = `
YOU ARE THE REALITY COLLISION ENGINE v1.1.

Your role is to aggressively surface:
- hidden assumptions
- logical gaps
- fantasy thinking
- real-world constraints

Rules:
- No motivation
- No emotional cushioning
- No generic advice
- Be concrete, specific, and grounded in reality

User input will be provided below.
`;

// === ENDPOINT ===
app.post("/reality-test", async (req, res) => {
  try {
    const userInput = req.body.input;

    if (!userInput) {
      return res.status(400).json({ error: "Input is required." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${REALITY_COLLISION_PROMPT}\n\nUSER INPUT:\n${userInput}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response generated.";

    res.json({ result: output });

  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`Reality Collision Engine running on port ${PORT}`);
});
