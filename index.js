import express from "express";
import fs from "fs";
import cors from "cors";
import fetch from "node-fetch"; // AI çağrısı için

const app = express();
app.use(cors());
app.use(express.json());

const IDEAS_FILE = "./ideas.json";

// -----------------------------
// Form 1: Hypothesis Tester
// -----------------------------
app.post("/decision-stress-test", async (req, res) => {
  const idea = req.body.idea;
  if (!idea) return res.status(400).json({ error: "No idea provided" });

  // AI mantığı burada çalışacak: Varsayım çürütme
  let aiResponse;
  try {
    const aiRequest = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Analyze this business idea and highlight hidden assumptions or potential flaws: "${idea}"`
      })
    });
    const aiData = await aiRequest.json();
    aiResponse = aiData.output_text || "AI response not available";
  } catch (err) {
    aiResponse = "AI processing failed, please try again later.";
  }

  // ideas.json kaydı
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

  // AI mantığı burada çalışacak: Gerçek dünya riskleri ve başarı analizi
  let aiResponse;
  try {
    const aiRequest = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Analyze this refined business idea for real-world risks, market constraints, and why it may fail: "${refinedIdea}". Previous hypothesis test: "${previousResult}"`
      })
    });
    const aiData = await aiRequest.json();
    aiResponse = aiData.output_text || "AI response not available";
  } catch (err) {
    aiResponse = "AI processing failed, please try again later.";
  }

  // ideas.json kaydı
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
