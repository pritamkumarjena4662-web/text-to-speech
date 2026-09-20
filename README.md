# 🔊 VoiceText - Text-to-Speech Application

A full-stack Text-to-Speech web application built using React.js, Node.js, and Express.js.

## 📌 Project Overview

VoiceText converts written text into speech. Users can enter or paste text, select a language and available voice, and generate speech directly in the browser.

The project demonstrates frontend and backend communication using REST APIs.

## ✨ Features

- Enter or paste text
- Character count
- Word count
- Maximum 500 characters
- Multiple language selection
- Voice selection
- Text-to-Speech generation
- Play and stop speech
- Clear text
- Input validation
- Error handling
- REST API backend
- Health check API
- Voice listing API
- Responsive user interface

## 🛠️ Technology Stack

### Frontend

- React.js
- JavaScript
- CSS3
- Axios
- Vite

### Backend

- Node.js
- Express.js
- CORS
- dotenv

### Development Tools

- VS Code
- Git
- GitHub
- Postman

## 📁 Project Structure

```text
text-to-speech/
│
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── .env
│
├── server/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md


🔗 API Endpoints
Health Check
GET /api/health
Get Available Voices
GET /api/voices
Get Supported Languages
GET /api/languages
Generate Speech
POST /api/tts

Example request:

{
  "text": "Hello, welcome to my Text-to-Speech application.",
  "language": "en-US",
  "voice": "Default Female Voice"
}

Example response:

{
  "success": true,
  "message": "Speech request accepted successfully.",
  "data": {
    "text": "Hello, welcome to my Text-to-Speech application.",
    "language": "en-US",
    "voice": "Default Female Voice"
  }
}
🚀 How to Run Locally
1. Clone the Repository
git clone https://github.com/pritamkumarjena4662-web/text-to-speech.git
cd text-to-speech
2. Start the Backend

Open a terminal:

cd server
npm install
npm run dev

Backend will run on:

http://localhost:5000
3. Start the Frontend

Open another terminal:

cd client
npm install
npm run dev

Frontend will run on:

http://localhost:5173
🔐 Environment Variables

Create .env files locally.

Client .env
VITE_API_URL=http://localhost:5000/api
Server .env
PORT=5000

Do not commit .env files to GitHub.

🔄 Application Flow
User
  ↓
React Frontend
  ↓
REST API Request
  ↓
Node.js + Express Backend
  ↓
Request Validation
  ↓
Text-to-Speech Processing
  ↓
Response
  ↓
Frontend
  ↓
Speech Playback
🧪 Testing

The following features were tested:

Empty text validation
Text character limit
Language selection
Voice selection
Speech generation
Speech playback
Stop speech
Clear text
Backend health API
Voices API
TTS API
Frontend-backend communication
🎯 Learning Outcomes

This project helps understand:

Web application structure
React frontend development
Node.js backend development
Express.js
REST APIs
Frontend and backend communication
Text-to-Speech integration
Input validation
Error handling
API testing
Git and GitHub
Full-stack application deployment
📌 Project Level
Basic Level
React
+
Node.js
+
Express.js
+
Text-to-Speech
🔮 Future Enhancements
Download generated audio
User authentication
Speech history
Favorites
More languages and voices
Text file upload
PDF/DOCX upload
AI text enhancement
Cloud audio storage
Voice customization
Usage limits
Admin dashboard
Analytics
👨‍💻 Developer

Pritam Kumar Jena

GitHub:

https://github.com/pritamkumarjena4662-web

📄 Project Information

Project: Text-to-Speech Application
Frontend: React.js
Backend: Node.js + Express.js
TTS: Browser Web Speech API
Repository: text-to-speech