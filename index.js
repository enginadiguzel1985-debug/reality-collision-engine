import express from "express";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("AI Engine is running");
});

app.get("/start", (req, res) => {
  res.send(`
    <html>
      <body style="font-family: Arial; padding:40px; max-width:600px;">
        <h2>Free Idea Stress Test</h2>

        <form method="POST" action="/run">
          <textarea 
            name="idea" 
            rows="6" 
            style="width:100%;" 
            placeholder="Write your business idea here"
          ></textarea>
          <br><br>
          <button type="submit">Run Free Stress Test</button>
        </form>
      </body>
    </html>
  `);
});

app.post("/run", (req, res) => {
  const idea = req.body.idea || "";

  const analysis = `
Assumption & Risk Analysis:

• Demand is unproven and must be validated.
• Costs and competition are likely underestimated.
• This is a preliminary reality check.
`;

  res.send(`
    <html>
      <body style="font-family: Arial; padding:40px; max-width:600px;">
        <h2>Free Result</h2>

        <pre>${analysis}</pre>

        <form method="GET" action="/start">
          <button>Edit idea & try again</button>
        </form>

        <br>

        <a href="https://feasibilityengine.com/products/decision-stress-test-access">
          <button>Unlock Full Reality Collision</button>
        </a>
      </body>
    </html>
  `);
});

app.listen(10000, () => {
  console.log("Server running on port 10000");
});
