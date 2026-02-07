import express from "express";
import bodyParser from "body-parser";
import { GoogleAuth } from "google-auth-library";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// =====================
// CONFIGURATION
// =====================
const PORT = process.env.PORT || 10000;
const PROJECT_ID = "gen-lang-client-0366781740";
const LOCATION = "us-central1";
const MODEL_ID = "gemini-2.0-flash-001"; // <-- SON MODEL
const ENDPOINT = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:generateContent`;

// Service account: JSON dosya veya ENV variable
let credentials = null;

if (process.env.SA_JSON) {
  // Env variable olarak yüklü JSON varsa
  credentials = JSON.parse(process.env.SA_JSON);
} else {
  // Aksi halde dosya yolu: service-account.json
  credentials = undefined; // keyFile parametresi ile okuruz
}

const auth = new GoogleAuth({
  credentials,
  keyFile: credentials ? undefined : "service-account.json",
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

// =====================
// HELPER: GENERATE CONTENT
// =====================
async function generateContent(prompt) {
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token.token || token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          text: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`[VertexAI.ClientError] ${response.status} ${errText}`);
  }

  return response.json();
}

// =====================
// ROUTES
// =====================
app.get("/", (req, res) => {
  res.send("Reality Collision Engine backend is running.");
});

app.get("/gemini-health-check", async (req, res) => {
  try {
    const result = await generateContent("Say hello");
    res.json({
      status: "ok",
      model: MODEL_ID,
      result: result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/generate", async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: "prompt required" });

    const result = await generateContent(prompt);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
