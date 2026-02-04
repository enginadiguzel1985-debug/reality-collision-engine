import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const IDEAS_FILE = "./ideas.json";

// Form 1: Hypothesis Tester
app.post("/decision-stress-test", (req, res) => {
  const idea = req.body.idea;
  if (!idea) return res.status(400).json({ error: "No idea provided" });

  let ideas = [];
  if (fs.existsSync(IDEAS_FILE)) {
    ideas = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
  }

  ideas.push({ idea, date: new Date() });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));

  // AI mantığı master prompt tarafından yürütülüyor
  // Shopify ile uyumlu JSON formatı
  res.json({ result: `Hypothesis test for idea: "${idea}". Master prompt yorumları burada.` });
});

// Form 2: Reality Collider
app.post("/reality-collision", (req, res) => {
  const refinedIdea = req.body.refined_idea;
  const previousResult = req.body.previous_result;

  if (!refinedIdea || !previousResult) {
    return res.status(400).json({ error: "Missing data" });
  }

  let ideas = [];
  if (fs.existsSync(IDEAS_FILE)) {
    ideas = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
  }

  ideas.push({ refinedIdea, previousResult, date: new Date() });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));

  // AI mantığı master prompt tarafından yürütülüyor
  res.json({
    result: `Reality collision for idea: "${refinedIdea}", based on previous: "${previousResult}". Master prompt detaylı risk ve başarı analizi burada.`
  });
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
