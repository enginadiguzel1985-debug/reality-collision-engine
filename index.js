// index.js
import express from "express";
import fs from "fs";
import { GoogleAuth } from "google-auth-library";
import { v1 } from "@google-cloud/vertexai";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// ==== GOOGLE SERVICE ACCOUNT & CLIENT SETUP ====
// Buraya Render’a yüklediğin JSON path veya direkt environment variable ile yol gösterebilirsin
const auth = new GoogleAuth({
  keyFile: "service-account.json", // Render'a yüklediğin JSON dosya adı
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

const client = new v1.PredictionServiceClient({ auth });

// ==== MODEL & ENDPOINT ====
// Model ID kesin olarak gemini-2.0-flash-001
const projectId = "gen-lang-client-0366781740";
const location = "us-central1";
const modelId = "gemini-2.0-flash-001";

const endpoint = `projects/${projectId}/locations/${location}/publishers/google/models/${modelId}`;

// ==== HEALTH CHECK ====
app.get("/gemini-health-check", async (req, res) => {
  try {
    // Basit tek satır test: model metadata çağırıyoruz
    const [response] = await client.getModel({ name: endpoint });
    res.json({ status: "ok", model: response.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==== CONTENT GENERATION ====
app.post("/generate", async (req, res) => {
  try {
    const userInput = req.body.prompt || "Hello, world!";
    const request = {
      name: endpoint,
      content: [
        {
          role: "user",
          text: userInput,
        },
      ],
    };

    const [response] = await client.predict(request);
    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ==== ROOT ====
app.get("/", (req, res) => {
  res.send("Reality Collision Engine Backend is running ✅");
});

// ==== START SERVER ====
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
