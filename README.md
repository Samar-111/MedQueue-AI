# MedQueue AI - Real-Time ER Voice Triage & Atomic Queue Engine

MedQueue AI is an intelligent clinical intake platform designed to eliminate emergency room overcrowding by replacing static paper intake with AI-driven voice triage, instant disease chips, and atomic queue re-ordering.

---

## 🔑 Environment Configuration (`.env`)

### 1. Server Configuration (`/server/.env`)

Create or update `server/.env` with your settings:

```env
PORT=5000
MONGODB_URI=
GEMINI_API_KEY=
OPENAI_API_KEY=
CLIENT_ORIGIN=http://localhost:5173
```

- **`GEMINI_API_KEY`**: Your Google Gemini API Key (get free at Google AI Studio). Powers Google Gemini AI clinical triage, ESI 1-5 level classification, and red-flag identification.
- **`OPENAI_API_KEY`**: Your OpenAI API Key (`sk-proj-...`). Optional alternative AI provider.
- **`MONGODB_URI`**: Your MongoDB connection URI (Atlas cloud or local `mongodb://127.0.0.1:27017/medqueue`). If left blank, the app runs on a high-performance in-memory database store with zero setup needed.

### 2. Client Configuration (`/client/.env`)

Create or update `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_SERVER_URL=http://localhost:5000
```

---

## 🌟 Core Features

1. **AI Voice & Symptom Intake Kiosk**:
   - Native Web Speech API & HTML5 microphone audio capture for English and Hindi (हिंदी).
   - Instant Tap-to-Add Common Disease & Symptom Chips.
   - Live clinical description box with real-time text appending.

2. **Emergency Severity Index (ESI 1-5) AI Triage**:
   - Evaluates patient symptoms against ESI protocol (Tier 1 Resuscitation to Tier 5 Non-Urgent).
   - Detects life-threatening red-flag symptoms (Cardiac, Respiratory, Hemorrhage, Stroke).

3. **Atomic Priority Queue Re-ordering**:
   - High-severity patients (ESI 1-2) automatically jump to the top queue rank.
   - Race-condition protection via atomic sorting logic.

4. **Real-Time Workstation Synchronization**:
   - Socket.io WebSockets sync Nurse Station, Doctor Workbench, and Public ER Lobby Board instantly.

5. **Warm Daylight Healthcare Aesthetic**:
   - Bright clinic photographic backdrop with glassmorphic cards and warm vanilla tones (`#FFFBF5`).

---

## 🚀 Local Quick Start

```bash
cd server
npm install
npm run dev

cd ../client
npm install
npm run dev
```

Open `http://localhost:5173` in Google Chrome or Microsoft Edge.
