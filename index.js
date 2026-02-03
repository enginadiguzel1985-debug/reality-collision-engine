// index.js
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// ideas.json dosyasının yolu (proje kökünde)
const ideasPath = path.join(process.cwd(), "ideas.json");

// ideas.json yoksa oluştur
if (!fs.existsSync(ideasPath)) {
  fs.writeFileSync(ideasPath, "[]", "utf8");
}

// GET /start -> sadece bir hoşgeldin mesajı
app.get("/start", (req, res) => {
  res.json({ message: "Reality Collision Engine live!" });
});

// POST /submit-idea -> fikir ekle
app.post("/submit-idea", (req, res) => {
  const { idea } = req.body;
  if (!idea || idea.trim() === "") {
    return res.status(400).json({ error: "Idea cannot be empty" });
  }

  let ideas = [];
  try {
    const data = fs.readFileSync(ideasPath, "utf8");
    ideas = JSON.parse(data);
  } catch (err) {
    console.error("Failed to read ideas.json:", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  // Yeni fikir ekle
  ideas.push({ idea: idea.trim(), createdAt: new Date().toISOString() });

  try {
    fs.writeFileSync(ideasPath, JSON.stringify(ideas, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write ideas.json:", err);
    return res.status(500).json({ error: "Internal server error" });
  }

  res.json({ message: "Idea submitted successfully!", idea: idea.trim() });
});

// Server başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
