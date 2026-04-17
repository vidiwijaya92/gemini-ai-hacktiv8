import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import cors from "cors";

const app = express();
const upload = multer();
const port = 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GEMINI_MODEL = "gemini-2.5-flash-lite";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/generate-text", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.status(200).json({ result: text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});

app.post("/generate-from-file", upload.single("file"), async (req, res) => {
  const { prompt } = req.body;
  const base64File = req.file.buffer.toString("base64");

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt, type: "text" },
        { inlineData: { data: base64File, mimeType: req.file.mimetype } },
      ],
    });

    const text =
      response.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    res.status(200).json({ result: text });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: e.message });
  }
});

app.post("/api/chat", async (req, res) => {
  const { conversation } = req.body;
  try {
    if (!Array.isArray(conversation))
      throw new Error("Messages must be an array!");

    const contents = conversation.map(({ role, text }) => ({
      // Jika role 'bot' atau 'model', pastikan jadi 'model'
      role: role === "user" ? "user" : "model",
      parts: [{ text }],
    }));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.9,
        systemInstruction:
          "Kamu adalah expert assistant dalam mengambil keputusan lokasi property yang paling menguntungkan untuk para milenials. gunakan bahasa yang ramah, santai dan sopan.the AI respond with markdown format, render it properly. also handle any errors with a popup, do not make the error response as a reply from your chat",
      },
    });
    res.status(200).json({ result: response.text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
