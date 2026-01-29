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
app.options("*", cors());

/* ===============================
   CONFIG
================================ */
const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => res.status(200).send("OK"));

/* =========================================================
   TEST ROUTE
========================================================= */
app.get("/test", (req, res) => res.send("Backend çalışıyor"));

/* =========================================================
   GEMINI CALL
========================================================= */
async function callGemini(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }]
      })
    }
  );
  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No output";
}

/* =========================================================
   ROUTES
========================================================= */
app.post("/decision-stress-test", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });
    const prompt = text; // Kendi prompt’unu buraya ekleyebilirsin
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/reality-collision", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });
    const prompt = text; // Kendi prompt’unu buraya ekleyebilirsin
    const result = await callGemini(prompt);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* =========================================================
   SERVER
========================================================= */
app.listen(PORT, () => console.log("Server running on port", PORT));
