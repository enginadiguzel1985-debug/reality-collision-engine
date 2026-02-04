import express from "express";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const IDEAS_FILE = "./ideas.json";

// --- Mevcut /submit-idea endpoint (koruyoruz) ---
app.post("/submit-idea", (req, res) => {
  const idea = req.body.idea;
  if (!idea) return res.status(400).json({ error: "No idea provided" });

  let ideas = [];
  if (fs.existsSync(IDEAS_FILE)) {
    ideas = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
  }

  ideas.push({ idea, date: new Date() });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));
  res.json({ status: "success", idea });
});

// --- Form 1: Hypothesis Tester ---
app.post("/decision-stress-test", (req, res) => {
  const idea = req.body.idea;
  if (!idea) return res.status(400).json({ error: "No idea provided" });

  let ideas = [];
  if (fs.existsSync(IDEAS_FILE)) {
    ideas = JSON.parse(fs.readFileSync(IDEAS_FILE, "utf-8"));
  }
  ideas.push({ idea, date: new Date() });
  fs.writeFileSync(IDEAS_FILE, JSON.stringify(ideas, null, 2));

  // Shopify ile uyumlu JSON response
  res.json({ result: `Received idea: ${idea}` });
});

// --- Form 2: Reality Collider ---
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

  // Shopify ile uyumlu JSON response
  res.json({ result: `Refined idea: ${refinedIdea}, based on previous: ${previousResult}` });
});

// --- Basit health check ---
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
