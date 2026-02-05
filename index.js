import express from "express";
import cors from "cors";
import {PredictionServiceClient} from "@google-cloud/aiplatform";

const app = express();
app.use(cors());
app.use(express.json());

const client = new PredictionServiceClient();

// Helper function to call Gemini 2.5 Flash model
async function callGemini(refinedIdea, previousResult = "") {
  const project = "gen-lang-client-0366781740"; // senin GCP projen
  const location = "us-central1"; // bölge
  const model = "gemini-2.5-flash"; // tavsiye edilen model

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
    // response.predictions[0] modeli cevabı döner
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
