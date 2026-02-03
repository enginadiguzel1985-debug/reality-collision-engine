import express from "express";
import session from "express-session";
import fetch from "node-fetch"; // Eğer Render’da yoksa npm install node-fetch yap

const app = express();
const PORT = process.env.PORT || 10000;

/* ---------- Middleware ---------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "feasibility-engine-secret",
    resave: false,
    saveUninitialized: true,
  })
);

/* ---------- START PAGE ---------- */
app.get("/start", (req, res) => {
  const idea = req.session.idea || "";

  res.send(`
    <h1>Free Idea Stress Test</h1>
    <form method="POST" action="/run">
      <textarea name="idea" rows="6" cols="60"
        placeholder="Write your business idea here">${idea}</textarea><br><br>
      <button type="submit">Run Free Stress Test</button>
    </form>
  `);
});

/* ---------- RUN FREE TEST ---------- */
app.post("/run", async (req, res) => {
  const { idea } = req.body;
  req.session.idea = idea;

  let aiResponse = "AI response failed.";

  try {
    // Google Gemini Flash 1.5 API çağrısı
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY; // Render üzerinde set et
    const response = await fetch("https://gemini.googleapis.com/v1/flash:generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gemini-flash-1.5",
        prompt: idea,
        maxOutputTokens: 200
      }),
    });

    const data = await response.json();
    aiResponse = data.output_text || "No response from Gemini";
  } catch (err) {
    console.error("Gemini API error:", err);
  }

  res.send(`
    <h2>Free Result</h2>
    <p><strong>AI Analysis:</strong></p>
    <pre>${aiResponse}</pre>

    <form method="GET" action="/start">
      <button>Edit idea & try again</button>
    </form>

    <br>

    <a href="https://feasibilityengine.com/products/decision-stress-test-access">
      <button>Unlock Full Reality Collision</button>
    </a>
  `);
});

/* ---------- ROOT ---------- */
app.get("/", (req, res) => {
  res.redirect("/start");
});

/* ---------- START SERVER ---------- */
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
