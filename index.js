import express from "express";
import bodyParser from "body-parser";
import { Client } from "@google-cloud/vertexai";
import fs from "fs";

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;

// Service account JSON dosyan varsa Render environment variable'da SA_JSON olarak ayarla
const serviceAccount = JSON.parse(process.env.SA_JSON || "{}");

// Vertex AI Client
const vertexClient = new Client({
  projectId: "gen-lang-client-0366781740",
  location: "us-central1",
  credentials: serviceAccount
});

// Test endpoint
app.get("/gemini-health-check", async (req, res) => {
  try {
    const response = await vertexClient.models.generateContent({
      model: "gemini-2.0-flash-001", // ✅ Burayı güncel model ID ile değiştirdik
      contents: [
        {
          role: "user",
          text: "Hello from Render test!"
        }
      ]
    });

    res.json({
      status: "success",
      modelResponse: response
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      full: error
    });
  }
});

// Liste endpoint
app.get("/list-models", async (req, res) => {
  try {
    const models = await vertexClient.models.list({
      publisher: "google"
    });
    res.json(models);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      full: error
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
