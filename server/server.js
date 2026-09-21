const express = require("express");
const cors = require("cors");
const googleTTS = require("@sefinek/google-tts-api");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Supported languages
const supportedLanguages = [
  { code: "en-US", name: "English" },
  { code: "hi-IN", name: "Hindi" },
  { code: "mr-IN", name: "Marathi" },
  { code: "gu-IN", name: "Gujarati" },
  { code: "es-ES", name: "Spanish" },
  { code: "fr-FR", name: "French" },
  { code: "de-DE", name: "German" }
];

// Voice list
const voices = [
  { name: "Default Female Voice", language: "en-US", gender: "Female" },
  { name: "Default Male Voice", language: "en-US", gender: "Male" },
  { name: "Hindi Voice", language: "hi-IN", gender: "Female" },
  { name: "Marathi Voice", language: "mr-IN", gender: "Female" },
  { name: "Gujarati Voice", language: "gu-IN", gender: "Female" },
  { name: "Spanish Voice", language: "es-ES", gender: "Female" },
  { name: "French Voice", language: "fr-FR", gender: "Female" },
  { name: "German Voice", language: "de-DE", gender: "Female" }
];

// Google TTS language mapping
const ttsLanguageMap = {
  "en-US": "en",
  "hi-IN": "hi",
  "mr-IN": "mr",
  "gu-IN": "gu",
  "es-ES": "es",
  "fr-FR": "fr",
  "de-DE": "de"
};

// ===============================
// HEALTH CHECK
// ===============================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Text-to-Speech backend is running",
    status: "OK"
  });
});

// ===============================
// LANGUAGES
// ===============================
app.get("/api/languages", (req, res) => {
  res.status(200).json({
    success: true,
    languages: supportedLanguages
  });
});

// ===============================
// VOICES
// ===============================
app.get("/api/voices", (req, res) => {
  res.status(200).json({
    success: true,
    voices
  });
});

// ===============================
// TEXT TO SPEECH
// ===============================
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language, voice } = req.body;

    // Validate text
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required."
      });
    }

    // Character limit
    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Text cannot exceed 500 characters."
      });
    }

    // Validate language
    const selectedLanguage = supportedLanguages.find(
      (item) => item.code === language
    );

    if (!selectedLanguage) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language."
      });
    }

    // Convert frontend language code to Google TTS language
    const ttsLanguage = ttsLanguageMap[language];

    if (!ttsLanguage) {
      return res.status(400).json({
        success: false,
        message: "TTS language is not supported."
      });
    }

    console.log("-----------------------------------");
    console.log("TTS Request");
    console.log("Language:", language);
    console.log("Voice:", voice);
    console.log("Text:", text);

    // Generate audio
    const audioChunks = await googleTTS.getAllAudioBase64(text, {
      lang: ttsLanguage,
      slow: false,
      host: "https://translate.google.com",
      timeout: 15000,
      splitPunct: ",.!?;:\n"
    });

    if (!audioChunks || audioChunks.length === 0) {
      throw new Error("No audio was generated.");
    }

    // Convert base64 chunks into MP3 buffer
    const audioBuffers = audioChunks.map((chunk) =>
      Buffer.from(chunk.base64, "base64")
    );

    const audioBuffer = Buffer.concat(audioBuffers);

    // Convert MP3 to base64
    const audioBase64 = audioBuffer.toString("base64");

    console.log("Audio generated successfully.");
    console.log("Audio size:", audioBuffer.length, "bytes");
    console.log("-----------------------------------");

    return res.status(200).json({
      success: true,
      message: "Speech generated successfully.",
      data: {
        text,
        language,
        voice: voice || "Default Voice",
        audioBase64,
        mimeType: "audio/mpeg",
        fileName: "speech.mp3"
      }
    });

  } catch (error) {
    console.error("TTS Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate speech. Please try again."
    });
  }
});

// ===============================
// 404 HANDLER
// ===============================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found."
  });
});

// ===============================
// ERROR HANDLER
// ===============================
app.use((error, req, res, next) => {
  console.error("Server Error:", error);

  res.status(500).json({
    success: false,
    message: "Something went wrong."
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log("-----------------------------------");
  console.log("Text-to-Speech Backend");
  console.log("-----------------------------------");
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log("-----------------------------------");
});