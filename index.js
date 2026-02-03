import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 10000;

/* ---------- middleware ---------- */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "feasibility-engine-secret",
    resave: false,
    saveUninitialized: true,
  })
);

/* ---------- JSON DATA ---------- */
const DATA_FILE = path.join(process.cwd(), "ideas.json");

// JSON dosyası yoksa oluştur
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

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
app.post("/run", (req, res) => {
  const { idea } = req.body;
  req.session.idea = idea;

  // JSON dosyasına kaydet
  const existingIdeas = JSON.parse(fs.readFileSync(DATA_FILE));
  existingIdeas.push({
    idea,
    timestamp: new Date().toISOString(),
  });
  fs.writeFileSync(DATA_FILE, JSON.stringify(existingIdeas, null, 2));

  res.send(`
    <h2>Free Result</h2>
    <p><strong>Assumption & Risk Analysis:</strong></p>
    <ul>
      <li>Demand is unproven and must be validated.</li>
      <li>Costs and competition are likely underestimated.</li>
      <li>This is a preliminary reality check.</li>
    </ul>

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
