import express from "express";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

// Mutlak yol: prod ve local uyumlu
const ideasPath = path.join(process.cwd(), "src", "ideas.json");

// Dosya yoksa oluştur ve içine boş dizi yaz
if (!fs.existsSync(ideasPath)) {
  fs.writeFileSync(ideasPath, "[]");
}

// Başlangıçta ideas.json'dan oku
let ideas = JSON.parse(fs.readFileSync(ideasPath, "utf8"));

// Ana sayfa
app.get("/", (req, res) => {
  res.send("Reality Collision Engine running");
});

// Başlat endpoint
app.get("/start", (req, res) => {
  res.json({ message: "Start endpoint", ideas });
});

// Fikir ekleme endpoint
app.post("/submit-idea", (req, res) => {
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ error: "Idea is required" });

  ideas.push({ idea, timestamp: new Date().toISOString() });

  // Her eklemede dosyayı güncelle
  fs.writeFileSync(ideasPath, JSON.stringify(ideas, null, 2));

  res.json({ message: "Idea submitted successfully", ideas });
});

// Port ayarı
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
