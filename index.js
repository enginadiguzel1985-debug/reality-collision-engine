import express from "express";
import cors from "cors";
import fs from "fs";
import { PredictionServiceClient } from "@google-cloud/aiplatform";

const app = express();
app.use(cors());
app.use(express.json());

// Servis hesabı JSON içeriğini geçici dosya olarak kaydet
const keyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
fs.writeFileSync("/tmp/vertex-key.json", keyJson);

// Vertex AI client
const client = new PredictionServiceClient({
  keyFile: "/tmp/vertex-key.json",
});

// Helper function to call Gemini 2.5 Flash model
async function callGemini(refinedIdea, previousResult = "") {
  const project = "gen-lang-client-0366781740";
  const location = "us-central1";
  const model = "gemini-2.5-flash";

  const request = {
    endpoint: `projects/${project}/locations/${location}/publishers/google/models/${model}`,
    instances: [
      {
        content: refinedIdea,
        previous_result: previousResult
      }
    ],
  };

  try {
    const [response] = await client.predict(request);
    return response.predictions[0];
  } catch (error) {
    console.error("Gemini call error:", error);
    throw error;
  }
}

// Routes
app.get("/healthz", (req, res) => {
  res.json({ status: "ok", message: "Reality engine running!" });
});

app.post("/decision-stress-test", async (req, res) => {
  const { idea } = req.body;
  try {
    const prediction = await callGemini(idea);
    res.json({ result: prediction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/reality-collision", async (req, res) => {
  const { refined_idea, previous_result } = req.body;
  try {
    const prediction = await callGemini(refined_idea, previous_result);
    res.json({ result: prediction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
