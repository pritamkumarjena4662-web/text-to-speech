import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function App() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en-US");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [audioUrl, setAudioUrl] = useState("");
  const [audioFileName, setAudioFileName] = useState("speech.mp3");

  const audioRef = useRef(null);

  const maxCharacters = 500;

  // ===============================
  // LOAD BROWSER VOICES
  // ===============================
  const loadVoices = () => {
    const availableVoices = window.speechSynthesis.getVoices();

    setVoices(availableVoices);

    const filtered = availableVoices.filter(
      (voice) => voice.lang === language
    );

    if (filtered.length > 0) {
      setSelectedVoice(filtered[0].name);
    } else if (availableVoices.length > 0) {
      setSelectedVoice(availableVoices[0].name);
    }
  };

  useEffect(() => {
    loadVoices();

    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();

      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // ===============================
  // UPDATE VOICE WHEN LANGUAGE CHANGES
  // ===============================
  useEffect(() => {
    const filtered = voices.filter(
      (voice) => voice.lang === language
    );

    if (filtered.length > 0) {
      setSelectedVoice(filtered[0].name);
    } else {
      setSelectedVoice("");
    }
  }, [language, voices]);

  const filteredVoices = voices.filter(
    (voice) => voice.lang === language
  );

  // ===============================
  // WORD COUNT
  // ===============================
  const wordCount = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  // ===============================
  // GENERATE SPEECH
  // ===============================
  const handleGenerateSpeech = async () => {
    setError("");
    setSuccess("");

    if (!text.trim()) {
      setError("Please enter some text first.");
      return;
    }

    if (text.length > maxCharacters) {
      setError(`Text cannot exceed ${maxCharacters} characters.`);
      return;
    }

    setIsGenerating(true);

    try {
      // Stop existing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      setIsSpeaking(false);

      // Send request to backend
      const response = await axios.post(`${API_URL}/tts`, {
        text: text,
        language: language,
        voice: selectedVoice,
      });

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Speech generation failed."
        );
      }

      const data = response.data.data;

      // ===============================
      // CONVERT BASE64 TO AUDIO BLOB
      // ===============================
   let base64 = data.audioBase64;

// Clean and normalize Base64
base64 = base64
  .replace(/^data:audio\/[^;]+;base64,/, "")
  .replace(/\s/g, "")
  .replace(/-/g, "+")
  .replace(/_/g, "/");

// Add missing Base64 padding
while (base64.length % 4 !== 0) {
  base64 += "=";
}

const binaryString = window.atob(base64);

const len = binaryString.length;

const bytes = new Uint8Array(len);

for (let i = 0; i < len; i++) {
  bytes[i] = binaryString.charCodeAt(i);
}
      const audioBlob = new Blob([bytes], {
        type: data.mimeType || "audio/mpeg",
      });

      // Create browser URL
      const url = URL.createObjectURL(audioBlob);

      // Remove previous URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }

      setAudioUrl(url);
      setAudioFileName(data.fileName || "speech.mp3");

      setSuccess("Speech generated successfully!");

      // ===============================
      // CREATE AUDIO PLAYER
      // ===============================
      const audio = new Audio(url);

      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
      };

      audio.onpause = () => {
        setIsSpeaking(false);
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        setError("Unable to play generated audio.");
      };

      // Automatically play generated audio
      await audio.play();

    } catch (err) {
      console.error("Backend Error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Backend rejected the request."
        );
      } else if (err.message) {
        setError(err.message);
      } else {
        setError(
          "Cannot connect to backend. Make sure server is running on port 5000."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // ===============================
  // STOP AUDIO
  // ===============================
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSpeaking(false);
  };

  // ===============================
  // PLAY AUDIO
  // ===============================
  const handlePlay = async () => {
    if (!audioRef.current && audioUrl) {
      const audio = new Audio(audioUrl);

      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
      };

      audio.onpause = () => {
        setIsSpeaking(false);
      };
    }

    if (audioRef.current) {
      try {
        await audioRef.current.play();
      } catch (err) {
        console.error("Audio Play Error:", err);
        setError("Unable to play audio.");
      }
    }
  };

  // ===============================
  // DOWNLOAD AUDIO
  // ===============================
  const handleDownload = () => {
    if (!audioUrl) {
      setError("Please generate speech first.");
      return;
    }

    const link = document.createElement("a");

    link.href = audioUrl;
    link.download = audioFileName || "speech.mp3";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    setSuccess("Audio downloaded successfully!");
  };

  // ===============================
  // CLEAR EVERYTHING
  // ===============================
  const handleClear = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    window.speechSynthesis.cancel();

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setText("");
    setIsSpeaking(false);
    setIsGenerating(false);

    setAudioUrl("");
    setAudioFileName("speech.mp3");

    setError("");
    setSuccess("");
  };

  return (
    <div className="app">

      {/* ===============================
          NAVBAR
      =============================== */}
      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">🔊</span>
          <span>VoiceText</span>
        </div>

        <span className="badge">
          Text-to-Speech
        </span>

      </header>

      <main className="container">

        {/* ===============================
            HERO
        =============================== */}
        <section className="hero">

          <p className="small-title">
            SMART SPEECH GENERATOR
          </p>

          <h1>
            Turn your <span>text into speech.</span>
          </h1>

          <p className="subtitle">
            Enter your text, choose a language and voice,
            then generate natural-sounding speech instantly.
          </p>

        </section>

        {/* ===============================
            TEXT CARD
        =============================== */}
        <section className="card">

          <div className="card-header">

            <div>
              <h2>
                Text to Speech
              </h2>

              <p>
                Enter the text you want to convert into audio.
              </p>
            </div>

            <div className="status">

              <span className="status-dot"></span>

              {isGenerating
                ? "Generating..."
                : isSpeaking
                ? "Speaking"
                : "Ready"}

            </div>

          </div>

          {/* TEXTAREA */}
          <div className="textarea-wrapper">

            <textarea
              value={text}
              onChange={(e) => {

                if (e.target.value.length <= maxCharacters) {

                  setText(e.target.value);

                  setError("");
                  setSuccess("");

                }

              }}
              placeholder="Type or paste your text here..."
              maxLength={maxCharacters}
            />

            <div className="text-info">

              <span>
                {wordCount} words
              </span>

              <span>
                {text.length}/{maxCharacters} characters
              </span>

            </div>

          </div>

          {/* SETTINGS */}
          <div className="settings">

            {/* LANGUAGE */}
            <div className="field">

              <label>
                Language
              </label>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(e.target.value)
                }
              >

                <option value="en-US">
                  🇺🇸 English
                </option>

                <option value="hi-IN">
                  🇮🇳 Hindi
                </option>

                <option value="mr-IN">
                  🇮🇳 Marathi
                </option>

                <option value="gu-IN">
                  🇮🇳 Gujarati
                </option>

                <option value="es-ES">
                  🇪🇸 Spanish
                </option>

                <option value="fr-FR">
                  🇫🇷 French
                </option>

                <option value="de-DE">
                  🇩🇪 German
                </option>

              </select>

            </div>

            {/* VOICE */}
            <div className="field">

              <label>
                Voice
              </label>

              <select
                value={selectedVoice}
                onChange={(e) =>
                  setSelectedVoice(e.target.value)
                }
              >

                {filteredVoices.length > 0 ? (

                  filteredVoices.map((voice) => (

                    <option
                      key={`${voice.name}-${voice.lang}`}
                      value={voice.name}
                    >
                      {voice.name}
                    </option>

                  ))

                ) : (

                  <option value="">
                    Default Voice
                  </option>

                )}

              </select>

            </div>

          </div>

          {/* SUCCESS */}
          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="actions">

            <button
              className="generate-btn"
              onClick={handleGenerateSpeech}
              disabled={isGenerating}
            >

              {isGenerating
                ? "⏳ Generating..."
                : isSpeaking
                ? "🔊 Speaking..."
                : "▶ Generate Speech"}

            </button>

            <button
              className="stop-btn"
              onClick={handleStop}
              disabled={!isSpeaking}
            >
              ■ Stop
            </button>

            <button
              className="clear-btn"
              onClick={handleClear}
            >
              Clear
            </button>

          </div>

        </section>

        {/* ===============================
            AUDIO CARD
        =============================== */}
        <section className="audio-card">

          <div className="audio-header">

            <div>

              <h2>
                Generated Audio
              </h2>

              <p>
                Your generated speech will appear here.
              </p>

            </div>

            <div
              className={
                isSpeaking
                  ? "playing active"
                  : "playing"
              }
            >

              <span></span>

              {isSpeaking
                ? "Playing"
                : audioUrl
                ? "Ready"
                : "Waiting"}

            </div>

          </div>

          {/* AUDIO PLAYER */}
          <div className="audio-player">

            <div className="audio-icon">
              🎧
            </div>

            <div className="audio-content">

              <strong>
                Text-to-Speech Audio
              </strong>

              {audioUrl ? (

                <audio
                  controls
                  src={audioUrl}
                  onPlay={() => setIsSpeaking(true)}
                  onPause={() => setIsSpeaking(false)}
                  onEnded={() => setIsSpeaking(false)}
                  style={{
                    width: "100%",
                    marginTop: "12px"
                  }}
                >
                  Your browser does not support audio playback.
                </audio>

              ) : (

                <div className="wave">

                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>

                </div>

              )}

            </div>

          </div>

          {/* AUDIO CONTROLS */}
          {audioUrl && (
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "15px"
              }}
            >

              <button
                className="generate-btn"
                onClick={handlePlay}
              >
                ▶ Play Audio
              </button>

              <button
                className="stop-btn"
                onClick={handleStop}
              >
                ■ Stop
              </button>

            </div>
          )}

          {/* DOWNLOAD */}
          <button
            className="download-btn"
            onClick={handleDownload}
            disabled={!audioUrl}
          >
            ⬇ Download Audio
          </button>

        </section>

        {/* ===============================
            FEATURES
        =============================== */}
        <section className="features">

          <div>

            <span>🌍</span>

            <h3>
              Multiple Languages
            </h3>

            <p>
              Choose from different supported
              languages.
            </p>

          </div>

          <div>

            <span>🎙️</span>

            <h3>
              Voice Selection
            </h3>

            <p>
              Select from available voices
              on your device.
            </p>

          </div>

          <div>

            <span>⚡</span>

            <h3>
              Fast Generation
            </h3>

            <p>
              Convert your text into speech
              quickly.
            </p>

          </div>

        </section>

      </main>

      {/* ===============================
          FOOTER
      =============================== */}
      <footer>

        <p>
          © 2026 VoiceText • Text-to-Speech Application
        </p>

      </footer>

    </div>
  );
}

export default App;