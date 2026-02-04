import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const IDEAS_FILE = "./ideas.json";

// Gemini 1.5 Flash API çağırma fonksiyonu
async function callGemini(prompt) {
  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GOOGLE_GEMINI_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: { text: prompt },
          temperature: 0.7,
          maxOutputTokens: 512,
        }),
      }
    );

    const data = await response.json();
    return data.candidates?.[0]?.content?.[0]?.text || "AI yanıtı alınamadı";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "AI işleme sırasında hata oluştu.";
  }
}

// Form 1: Hypothesis Tester
app.post("/decision-stress-test", async (req, res) => {
  const idea = req.body.idea;
  if (!idea) return res.status(400).json({ error: "No idea provided" });

  // AI ile yorum
  const aiResult = await callGemini(
    `Analyze this business idea for hidden assumptions and potential risks: "${idea}"`
  );

  // JSON dosyaya kaydet
  let ideas = [];
  if (fs.existsSync(IDEAS_FILE)) {
    ideas = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
  }
  ideas.push({ idea, aiResult, date: new Date() });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));

  res.json({ result: aiResult });
});

// Form 2: Reality Collider
app.post("/reality-collision", async (req, res) => {
  const refinedIdea = req.body.refined_idea;
  const previousResult = req.body.previous_result;

  if (!refinedIdea || !previousResult) {
    return res.status(400).json({ error: "Missing data" });
  }

  const aiResult = await callGemini(
    `Analyze this refined business idea for real-world feasibility, risks, and market challenges. Base your analysis on the previous result: "${previousResult}". Idea: "${refinedIdea}"`
  );

  let ideas = [];
  if (fs.existsSync(IDEAS_FILE)) {
    ideas = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
  }
  ideas.push({ refinedIdea, previousResult, aiResult, date: new Date() });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));

  res.json({ result: aiResult });
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
