import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

// Kısaltılmış test master promptlar (sadece deploy için)
const decisionStressPrompt = "Short test prompt for decision stress test.";
const realityCollisionPrompt = "Short test prompt for reality collision.";

app.post("/decision-stress-test", async (req, res) => {
  try {
    const idea = req.body.idea;
    // Render AI endpoint çağrısı
    const response = await fetch("https://reality-collision-engine-1.onrender.com/decision-stress-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: decisionStressPrompt, idea }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/reality-collision", async (req, res) => {
  try {
    const idea = req.body.idea;
    const response = await fetch("https://reality-collision-engine-1.onrender.com/reality-collision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: realityCollisionPrompt, idea }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
