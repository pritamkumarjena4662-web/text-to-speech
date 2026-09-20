const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Supported languages
const supportedLanguages = [
  {
    code: "en-US",
    name: "English",
  },
  {
    code: "hi-IN",
    name: "Hindi",
  },
  {
    code: "mr-IN",
    name: "Marathi",
  },
  {
    code: "gu-IN",
    name: "Gujarati",
  },
  {
    code: "es-ES",
    name: "Spanish",
  },
  {
    code: "fr-FR",
    name: "French",
  },
  {
    code: "de-DE",
    name: "German",
  },
];

// Available voices
const voices = [
  {
    name: "Default Female Voice",
    language: "en-US",
    gender: "Female",
  },
  {
    name: "Default Male Voice",
    language: "en-US",
    gender: "Male",
  },
  {
    name: "Hindi Voice",
    language: "hi-IN",
    gender: "Female",
  },
  {
    name: "Marathi Voice",
    language: "mr-IN",
    gender: "Female",
  },
  {
    name: "Gujarati Voice",
    language: "gu-IN",
    gender: "Female",
  },
  {
    name: "Spanish Voice",
    language: "es-ES",
    gender: "Female",
  },
  {
    name: "French Voice",
    language: "fr-FR",
    gender: "Female",
  },
  {
    name: "German Voice",
    language: "de-DE",
    gender: "Female",
  },
];

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Text-to-Speech backend is running",
    status: "OK",
  });
});

// Get supported languages
app.get("/api/languages", (req, res) => {
  res.status(200).json({
    success: true,
    languages: supportedLanguages,
  });
});

// Get available voices
app.get("/api/voices", (req, res) => {
  res.status(200).json({
    success: true,
    voices,
  });
});

// Generate speech request
app.post("/api/tts", async (req, res) => {
  try {
    const { text, language, voice } = req.body;

    // Validate text
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Text is required.",
      });
    }

    // Maximum text length
    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Text cannot exceed 500 characters.",
      });
    }

    // Validate language
    const selectedLanguage = supportedLanguages.find(
      (item) => item.code === language
    );

    if (!selectedLanguage) {
      return res.status(400).json({
        success: false,
        message: "Unsupported language.",
      });
    }

    // Validate voice if provided
    if (voice) {
      const selectedVoice = voices.find(
        (item) =>
          item.name === voice &&
          item.language === language
      );

      // Browser voice names may differ, so don't block valid requests.
      if (!selectedVoice) {
        console.log(
          `Browser voice "${voice}" used for language ${language}`
        );
      }
    }

    /*
      The actual speech generation is currently handled
      by the browser Web Speech API.

      This backend validates the request and provides the
      API architecture required for future cloud TTS integration.
    */

    return res.status(200).json({
      success: true,
      message: "Speech request accepted successfully.",
      data: {
        text,
        language,
        voice: voice || "Default Voice",
      },
    });
  } catch (error) {
    console.error("TTS Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Something went wrong.",
  });
});

app.listen(PORT, () => {
  console.log("-----------------------------------");
  console.log("Text-to-Speech Backend");
  console.log("-----------------------------------");
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log("-----------------------------------");
});