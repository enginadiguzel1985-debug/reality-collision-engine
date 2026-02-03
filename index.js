import express from "express";
import fs from "fs";
import path from "path";
import session from "express-session";

const app = express();
const PORT = process.env.PORT || 10000;

// JSON verilerinin kaydedileceği dosya yolu
const ideasFilePath = path.join(process.cwd(), "src", "ideas.json");

// Ortam için JSON dosyası yoksa oluştur
if (!fs.existsSync(ideasFilePath)) {
  fs.writeFileSync(ideasFilePath, "[]", "utf8");
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "replace_this_with_a_secure_secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Başlangıç endpointi
app.get("/start", (req, res) => {
  res.json({
    message: "Reality Collision Engine Başladı",
  });
});

// Fikir gönderme endpointi
app.post("/submit-idea", (req, res) => {
  const { idea } = req.body;

  if (!idea || idea.trim() === "") {
    return res.status(400).json({ error: "Idea boş olamaz" });
  }

  // Mevcut fikirleri oku
  let ideas = [];
  try {
    const data = fs.readFileSync(ideasFilePath, "utf8");
    ideas = JSON.parse(data);
  } catch (err) {
    console.error("ideas.json okunamadı:", err);
  }

  // Yeni fikri ekle
  ideas.push({
    idea: idea.trim(),
    timestamp: new Date().toISOString(),
  });

  // Dosyaya yaz
  try {
    fs.writeFileSync(ideasFilePath, JSON.stringify(ideas, null, 2), "utf8");
  } catch (err) {
    console.error("ideas.json yazılamadı:", err);
    return res.status(500).json({ error: "Fikir kaydedilemedi" });
  }

  res.json({ message: "Fikir kaydedildi", idea: idea.trim() });
});

// Sunucu başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
