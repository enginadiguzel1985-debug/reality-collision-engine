import express from "express";
import bodyParser from "body-parser";
import { GoogleAuth } from "google-auth-library";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// 🔐 Service Account Auth
const auth = new GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON),
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

async function callGemini(prompt) {
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const res = await fetch(
    "https://us-central1-aiplatform.googleapis.com/v1/projects/gen-lang-client-0366781740/locations/us-central1/publishers/google/models/gemini-1.5-pro:generateContent",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  return res.json();
}

// 🔹 decision-stress-test
app.post("/decision-stress-test", async (req, res) => {
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: "idea is required" });
  }

  const prompt = `Stress-test this business idea brutally:\n\n${idea}`;
  const result = await callGemini(prompt);

  res.json(result);
});

// 🔹 reality-collision
app.post("/reality-collision", async (req, res) => {
  const { refined_idea, previous_result } = req.body;

  if (!refined_idea || !previous_result) {
    return res.status(400).json({ error: "missing fields" });
  }

  const prompt = `
Original analysis:
${previous_result}

Now collide this refined idea with reality:
${refined_idea}
`;

  const result = await callGemini(prompt);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Reality engine running on port ${PORT}`);
});
