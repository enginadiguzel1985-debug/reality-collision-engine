import express from 'express';
import session from 'express-session';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(session({
  secret: 'replace-with-strong-secret',
  resave: false,
  saveUninitialized: true
}));

// ideas.json yolu
const ideasFile = path.join(process.cwd(), 'src', 'ideas.json');

// Fikirleri kaydetme fonksiyonu
function saveIdea(idea) {
  let ideas = [];
  try {
    const data = fs.readFileSync(ideasFile, 'utf8');
    ideas = data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('ideas.json okunamadı, yeni dosya oluşturuluyor.');
  }

  ideas.push({ idea, timestamp: new Date().toISOString() });
  fs.writeFileSync(ideasFile, JSON.stringify(ideas, null, 2), 'utf8');
}

// Routes
app.get('/', (req, res) => {
  res.send('Reality Collision Engine API is live!');
});

app.get('/start', (req, res) => {
  res.json({ message: 'AI engine ready. Submit your idea via /submit-idea.' });
});

app.post('/submit-idea', (req, res) => {
  const { idea } = req.body;
  if (!idea) {
    return res.status(400).json({ error: 'Idea is required' });
  }

  // Fikri kaydet
  saveIdea(idea);

  // Örnek AI cevabı
  const aiResponse = {
    summary: "Demand is unproven and must be validated.",
    risk: "Costs and competition are likely underestimated.",
    advice: "This is a preliminary reality check."
  };

  res.json(aiResponse);
});

app.post('/run', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  // Örnek: Google Gemini veya başka AI endpoint ile çalışacak
  // Burada fetch ile gerçek API çağrısı yapılabilir
  // Örnek cevap:
  const aiResult = {
    result: "This is a simulated AI analysis for your prompt.",
    details: "You can extend this with more complex logic or AI API calls."
  };

  res.json(aiResult);
});

// Server başlatma
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
