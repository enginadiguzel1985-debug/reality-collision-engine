import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

// ideas.json dosyasının doğru yolu
const ideasFilePath = path.join(process.cwd(), "src", "ideas.json");

// ideas.json yoksa oluştur
if (!fs.existsSync(ideasFilePath)) {
  fs.writeFileSync(ideasFilePath, "[]");
}

// Middleware
app.use(express.json());
app.use(session({
  secret: "secret-key",
  resave: false,
  saveUninitialized: true
}));

// Başlangıç sayfası
app.get("/", (req, res) => {
  res.send("Reality Collision Engine is running!");
});

// Başlat sayfası
app.get("/start", (req, res) => {
  res.send("Engine started.");
});

// İş fikri submit endpoint
app.post("/submit-idea", (req, res) => {
  const { idea } = req.body;
  if (!idea) {
    return res.status(400).json({ error: "Idea is required" });
  }

  // Mevcut fikirleri oku
  let ideas = [];
  try {
    const data = fs.readFileSync(ideasFilePath, "utf-8");
    ideas = JSON.parse(data);
  } catch (err) {
    console.error("Error reading ideas.json:", err);
  }

  // Yeni fikri ekle
  ideas.push({ idea, timestamp: new Date().toISOString() });

  // ideas.json'a yaz
  try {
    fs.writeFileSync(ideasFilePath, JSON.stringify(ideas, null, 2));
  } catch (err) {
    console.error("Error writing ideas.json:", err);
    return res.status(500).json({ error: "Failed to save idea" });
  }

  res.json({ message: "Idea submitted successfully", idea });
});

// Sunucu başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
