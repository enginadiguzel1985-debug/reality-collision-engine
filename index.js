import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());

// Güvenli Gemini çağırma fonksiyonu
async function callGemini(promptText) {
  try {
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta2/models/gemini-1.5-flash:generateText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GOOGLE_GEMINI_API_KEY}`
        },
        body: JSON.stringify({ prompt: { text: promptText } })
      }
    );

    const data = await response.json().catch(() => null);

    if (!data || data.error || !data.candidates) {
      console.error('Gemini API hatası veya geçersiz JSON', data);
      return 'AI işleme sırasında hata oluştu.';
    }

    // Normal durumda text döndür
    return data.candidates[0].content[0].text || 'AI işleme sırasında hata oluştu.';
  } catch (err) {
    console.error('Gemini çağrısı başarısız:', err);
    return 'AI işleme sırasında hata oluştu.';
  }
}

// Decision-Stress-Test endpoint
app.post('/decision-stress-test', async (req, res) => {
  const { idea } = req.body;
  if (!idea) return res.status(400).json({ result: 'Idea alanı gerekli' });

  const result = await callGemini(`Hypothesis test for idea: "${idea}"`);
  res.json({ result });
});

// Reality-Collision endpoint
app.post('/reality-collision', async (req, res) => {
  const { refined_idea, previous_result } = req.body;
  if (!refined_idea || !previous_result)
    return res.status(400).json({ result: 'refined_idea ve previous_result gerekli' });

  const result = await callGemini(
    `Reality collision for idea: "${refined_idea}", based on previous: "${previous_result}"`
  );
  res.json({ result });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
