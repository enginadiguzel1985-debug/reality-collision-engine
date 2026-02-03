import express from "express";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(
  session({
    secret: "verysecretkey",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 }, // 10 dakika
  })
);

// Static front-end dosyaları
app.use(express.static(path.join(__dirname, "public")));

// /start sayfası
app.get("/start", (req, res) => {
  const idea = req.session.idea || "";
  res.send(`
    <html>
    <head>
      <title>Free Idea Stress Test</title>
    </head>
    <body>
      <h2>Free Idea Stress Test</h2>
      <form action="/result" method="POST">
        <textarea id="ideaInput" name="idea" placeholder="Write your business idea here" rows="4" cols="50">${idea}</textarea><br>
        <button type="submit">Run Free Stress Test</button>
      </form>

      <script>
        // LocalStorage backup
        const input = document.getElementById('ideaInput');
        const savedIdea = localStorage.getItem('userIdea');
        if(savedIdea) input.value = savedIdea;
        input.addEventListener('input', () => {
          localStorage.setItem('userIdea', input.value);
        });
      </script>
    </body>
    </html>
  `);
});

// /result sayfası
app.post("/result", (req, res) => {
  const userIdea = req.body.idea || "";
  req.session.idea = userIdea;

  res.send(`
    <html>
    <head><title>Free Result</title></head>
    <body>
      <h2>Free Result</h2>
      <p>Assumption & Risk Analysis:</p>
      <ul>
        <li>Demand is unproven and must be validated.</li>
        <li>Costs and competition are likely underestimated.</li>
        <li>This is a preliminary reality check.</li>
      </ul>
      <form action="/start" method="GET">
        <button type="submit">Edit idea & try again</button>
      </form>
      <a href="https://feasibilityengine.com/products/decision-stress-test-access">
        <button>Unlock Full Reality Collision</button>
      </a>
    </body>
    </html>
  `);
});

// Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
