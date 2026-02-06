import express from "express";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());

// 🔹 Prompts fiziksel olarak burada tanımlı olacak
const decisionStressPrompt = "Decision stress test prompt goes here...";
const realityCollisionPrompt = "Reality collision prompt goes here...";

// 🔹 Decision Stress Test endpoint
app.post("/decision-stress-test", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea missing" });

    // Node 20 global fetch kullanıyoruz
    const response = await fetch("https://your-render-backend-endpoint/decision-stress-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, prompt: decisionStressPrompt })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// 🔹 Reality Collision endpoint
app.post("/reality-collision", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea) return res.status(400).json({ error: "Idea missing" });

    const response = await fetch("https://your-render-backend-endpoint/reality-collision", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idea, prompt: realityCollisionPrompt })
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI processing failed" });
  }
});

// 🔹 Render port binding
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
