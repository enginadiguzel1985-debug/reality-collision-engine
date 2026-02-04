import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const IDEAS_FILE = "./ideas.json";

// Helper: Google Gemini çağrısı
async function callGemini(prompt) {
  try {
    const resp = await fetch("https://gemini.googleapis.com/v1beta2/responses:generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GOOGLE_GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gemini-1.5-flash",
        prompt: [
          {
            content: prompt,
            type: "text"
          }
        ]
      })
    });
    const data = await resp.json();
    return data.candidates?.[0]?.content || "AI yanıtı alınamadı";
  } catch (err) {
    console.error(err);
    return "AI işleme sırasında hata oluştu.";
  }
}

// -----------------------------
// Form 1: Hypothesis Tester
// -----------------------------
app.post("/decision-stress-test", async (req, res) => {
  const idea = req.body.idea;
  if (!idea) return res.status(400).json({ error: "No idea provided" });

  const aiResponse = await callGemini(`Analyze this business idea and highlight hidden assumptions or potential flaws: "${idea}"`);

  let ideas = [];
  if (fs.existsSync(IDEAS_FILE)) {
    ideas = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
  }
  ideas.push({ idea, aiResponse, date: new Date() });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));

  res.json({ result: aiResponse });
});

// -----------------------------
// Form 2: Reality Collider
// -----------------------------
app.post("/reality-collision", async (req, res) => {
  const refinedIdea = req.body.refined_idea;
  const previousResult = req.body.previous_result;

  if (!refinedIdea || !previousResult) {
    return res.status(400).json({ error: "Missing data" });
  }

  const aiResponse = await callGemini(
    `Analyze this refined business idea for real-world risks, market constraints, and why it may fail: "${refinedIdea}". Previous hypothesis test: "${previousResult}"`
  );

  let ideas = [];
  if (fs.existsSync(IDEAS_FILE)) {
    ideas = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
  }
  ideas.push({ refinedIdea, previousResult, aiResponse, date: new Date() });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));

  res.json({ result: aiResponse });
});

// -----------------------------
// Health Check
// -----------------------------
app.get("/", (req, res) => {
  res.send("Server is running");
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
