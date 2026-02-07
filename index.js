import express from "express";
import { VertexAI } from "@google-cloud/vertexai";

const app = express();
app.use(express.json());

const vertexAI = new VertexAI({
  project: "gen-lang-client-0366781740",
  location: "us-central1",
});

const model = vertexAI.getGenerativeModel({
  model: "gemini-1.5-flash-001",
});

app.get("/gemini-health-check", async (req, res) => {
  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: "ping" }],
        },
      ],
    });

    res.json({
      ok: true,
      text: result.response.text(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
