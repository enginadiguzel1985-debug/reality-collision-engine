import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// ideas.json dosyasının yolu (Render için doğru)
const ideasFilePath = path.join(process.cwd(), "src", "ideas.json");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

// Ana sayfa
app.get("/", (req, res) => {
  res.send("Reality Collision Engine is running.");
});

// Start endpoint
app.get("/start", (req, res) => {
  res.json({ message: "Server ready for ideas!" });
});

// Run endpoint (örnek)
app.post("/run", async (req, res) => {
  const { input } = req.body;
  const response = await fetch("https://api.example.com/process", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  const data = await response.json();
  res.json(data);
});

// Idea submission
app.post("/submit-idea", (req, res) => {
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: "Idea is required." });

  let ideas = [];
  try {
    if (fs.existsSync(ideasFilePath)) {
      const fileData = fs.readFileSync(ideasFilePath, "utf-8");
      ideas = JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Error reading ideas.json:", err);
  }

  ideas.push({ idea, timestamp: new Date().toISOString() });

  try {
    fs.writeFileSync(ideasFilePath, JSON.stringify(ideas, null, 2));
  } catch (err) {
    console.error("Error writing ideas.json:", err);
    return res.status(500).json({ error: "Failed to save idea." });
  }

  res.json({ message: "Idea saved successfully!", idea });
});

// Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
