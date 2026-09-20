import { useEffect, useState } from "react";
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

  const maxCharacters = 500;

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
    };
  }, []);

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

  const wordCount = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  // Generate speech
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
      // Send request to backend
      const response = await axios.post(`${API_URL}/tts`, {
        text: text,
        language: language,
        voice: selectedVoice,
      });

      if (response.data.success) {
        setSuccess("Speech generated successfully!");

        // Stop previous speech
        window.speechSynthesis.cancel();

        // Browser Text-to-Speech
        const speech = new SpeechSynthesisUtterance(text);

        speech.lang = language;

        const selected = voices.find(
          (voice) => voice.name === selectedVoice
        );

        if (selected) {
          speech.voice = selected;
        }

        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        speech.onstart = () => {
          setIsSpeaking(true);
        };

        speech.onend = () => {
          setIsSpeaking(false);
        };

        speech.onerror = () => {
          setIsSpeaking(false);
          setError("Unable to play generated speech.");
        };

        window.speechSynthesis.speak(speech);
      }
    } catch (err) {
      console.error("Backend Error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            "Backend rejected the request."
        );
      } else {
        setError(
          "Cannot connect to backend. Make sure server is running on port 5000."
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Stop speech
  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  // Clear everything
  const handleClear = () => {
    window.speechSynthesis.cancel();

    setText("");
    setIsSpeaking(false);
    setError("");
    setSuccess("");
  };

  // Download placeholder
  const handleDownload = () => {
    setError(
      "Audio download will be enabled after connecting a cloud TTS provider."
    );
  };

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🔊</span>
          <span>VoiceText</span>
        </div>

        <span className="badge">Text-to-Speech</span>
      </header>

      <main className="container">

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

        <section className="card">

          <div className="card-header">
            <div>
              <h2>Text to Speech</h2>

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

          <div className="textarea-wrapper">

            <textarea
              value={text}
              onChange={(e) => {
                if (
                  e.target.value.length <=
                  maxCharacters
                ) {
                  setText(e.target.value);
                  setError("");
                  setSuccess("");
                }
              }}
              placeholder="Type or paste your text here..."
              maxLength={maxCharacters}
            />

            <div className="text-info">
              <span>{wordCount} words</span>

              <span>
                {text.length}/{maxCharacters} characters
              </span>
            </div>
          </div>

          <div className="settings">

            <div className="field">
              <label>Language</label>

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

            <div className="field">
              <label>Voice</label>

              <select
                value={selectedVoice}
                onChange={(e) =>
                  setSelectedVoice(e.target.value)
                }
              >
                {filteredVoices.length > 0 ? (
                  filteredVoices.map((voice) => (
                    <option
                      key={voice.name}
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

          {success && (
            <div className="success-message">
              ✅ {success}
            </div>
          )}

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

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

        <section className="audio-card">

          <div className="audio-header">

            <div>
              <h2>Generated Audio</h2>

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
                : "Ready"}
            </div>

          </div>

          <div className="audio-player">

            <div className="audio-icon">
              🎧
            </div>

            <div className="audio-content">

              <strong>
                Text-to-Speech Audio
              </strong>

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

            </div>

          </div>

          <button
            className="download-btn"
            onClick={handleDownload}
          >
            ⬇ Download Audio
          </button>

        </section>

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

      <footer>
        <p>
          © 2026 VoiceText • Text-to-Speech Application
        </p>
      </footer>
    </div>
  );
}

export default App;