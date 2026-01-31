import express from "express";

const app = express();
app.use(express.json());

// TRANSLATE endpoint devre dışı bırakıldı
app.post("/translate", (req, res) => {
  return res.status(403).json({ ok: false, error: "TRANSLATION_DISABLED" });
});

// Test ve kayıt endpointleri hâlâ çalışabilir
app.get("/", (req, res) => {
  res.json({ ok: true, message: "Server is running in English-only mode." });
});

// Örnek: test endpoint (gerekiyorsa ekle)
app.post("/test", (req, res) => {
  const { name } = req.body;
  res.json({ ok: true, received: name || "No name provided" });
});

app.listen(process.env.PORT || 10000, () => console.log("Server running on port 10000"));
