import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const app = express();
app.use(express.json());

/* =========================
   HARD ENV CHECK
========================= */
if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing. Deploy aborted.");
}

/* =========================
   GEMINI INIT (ISOLATED)
========================= */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/* =========================
   TEST ENDPOINT
========================= */
app.post("/gemini-health-check", async (req, res) => {
  try {
    const result = await model.generateContent("Say only: Gemini is alive.");
    const text = result.response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty Gemini response");
    }

    res.json({
      success: true,
      ai_response: text
    });
  } catch (err) {
    console.error("GEMINI TEST ERROR:", err.message);

    res.status(500).json({
      success: false,
      error: "Gemini did not respond"
    });
  }
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Gemini health check server running on port ${PORT}`);
});
