# MedQueue AI - Real-Time ER Voice Triage & Atomic Queue Engine

[![Live Application](https://img.shields.io/badge/Live_Demo-med--queue--ai.vercel.app-brightgreen?style=for-the-badge&logo=vercel)](https://med-queue-ai.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Samar--111/MedQueue--AI-blue?style=for-the-badge&logo=github)](https://github.com/Samar-111/MedQueue-AI)
[![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)](https://github.com/Samar-111/MedQueue-AI)

> **Live Demo**: [https://med-queue-ai.vercel.app/](https://med-queue-ai.vercel.app/)

**MedQueue AI** is an intelligent, full-stack emergency healthcare queue management system designed to eliminate emergency room overcrowding by replacing static paper intake with AI voice triage, automated Emergency Severity Index (ESI Tiers 1–5) classification, atomic queue re-ordering, and multi-workstation WebSocket synchronization.

---

## 🏗️ System Architecture & Data Flow

```text
[Patient Spoken/Typed Symptoms] 
            │
            ▼
[Dual AI Triage Engine] ──────────► (Google Gemini 2.5 Flash / OpenAI GPT-4o-mini)
            │                        └─► Fallback: Internal Clinical Rule Engine
            ▼
[Atomic Queue Re-Ordering Engine] ──► ESI 1 & 2 Emergency Patients Jump to Rank #1
            │
            ▼
[Socket.io Real-Time Broadcast] 
      ├──► Nurse Station Board (Vitals Telemetry & Room Assignment)
      ├──► Doctor Workbench (Clinical Notes & 1-Click Discharge)
      └──► ER Lobby Public Display Board (Now Serving & Emergency Banners)
```

---

## 🌟 Key Features & Functional Modules

### 1. 🎙️ AI Voice & Symptom Intake Kiosk (`/intake`)
- **Dual-Language Voice Speech**: Supports **English (US)** and **Hindi (हिंदी)** for microphone voice speech-to-text using Web Speech API and MediaRecorder audio capture.
- **Audio Waveform Visualizer**: Live animated canvas wave offering visual microphone recording feedback.
- **Instant Tap-to-Add Disease Chips**: 1-click symptom chips (`🫀 Severe Chest Pain`, `🫁 Shortness of Breath`, `🌡️ High Fever`, `🧠 Migraine`, `🤢 Abdominal Pain`, `🩸 Bleeding`, `🦴 Trauma`, `😷 Cough`).
- **Single-Disease Custom Input**: Text field allowing users to type specific medical conditions (*Dengue*, *Asthma*) and click **"+ Add to Box"**.
- **AI ESI Classification**: Calculates ESI Level (1 to 5), chief complaint, red-flag symptoms, protocol rationale, and estimated doctor handling time.

### 2. ⚡ Dual AI Triage Engine & Zero-Credit Fallback
- **Google Gemini API (`gemini-2.5-flash`)**: Primary free AI provider via `@google/genai` with Zod structured output validation.
- **OpenAI API (`gpt-4o-mini`)**: Alternative AI provider via `openai` SDK.
- **Zero-Downtime Local Rule Fallback Engine**: If no API key is set or if quota is exceeded (HTTP 429), the backend automatically runs an internal clinical rule engine so 100% of website features continue running seamlessly with zero downtime.

### 3. 🛡️ Atomic Priority Queue Re-ordering Engine
- **Emergency Priority Jump**: High-severity patients (ESI 1 & 2) automatically jump to queue Rank #1.
- **ACID Race-Condition Protection**: Enforces race-condition protection via MongoDB transactions and synchronized memory locks.

### 4. 🩺 Nurse Command & Triage Station (`/nurse`)
- **Live Atomic Queue Board**: Interactive list ordered strictly by ESI rank with glowing urgency badges.
- **Search & ESI Filter**: Filter waiting list by Name, Ticket ID, Chief Complaint, or ESI Level (ALL, ESI 1–5).
- **Vital Signs Telemetry Input**: Record Heart Rate (bpm), Blood Pressure (mmHg), SpO2 (%), and Temperature (°F).
- **Manual ESI Escalation Override**: Nurses can manually adjust assigned ESI levels based on clinical observations.
- **Exam Room Assignment**: Assign trauma bays or exam rooms (*Trauma Bay 1*, *Room 102*).

### 5. 👨‍⚕️ Doctor Workbench (`/doctor`)
- **Active Consultation Panel**: View patient vitals, AI summary, red flags, and recommended protocol.
- **Physician Notes**: Record diagnostic notes, prescriptions, and treatment plans.
- **1-Click Discharge**: Complete session, update ER metrics, trigger confetti feedback, and automatically call the next priority candidate.

### 6. 📺 Public ER Lobby Display Board (`/lobby`)
- **Now Serving Cards**: High-visibility cards displaying ticket numbers, patient names, assigned room numbers, and attending doctors.
- **Emergency Alert Banner**: Pulsing banner alerting waiting room occupants whenever a critical emergency patient enters triage.

### 7. 📊 Telemetry & Analytics Modal
- Real-time statistics: Total patients intake volume, average handling time, ESI level distribution bar chart, and red-flag statistics.

---

## 🛠️ Technology Stack

| Layer | Framework / Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18 & Vite | Fast component rendering and reactive state management |
| **Styling & Theme** | Tailwind CSS | Warm daylight clinical theme (`#FFFBF5` vanilla cream tones) |
| **Animations** | Framer Motion & Canvas Confetti | Smooth queue list animations and discharge celebrations |
| **Icons** | Lucide React | Medical iconography (Stethoscope, ShieldAlert, Mic, Vitals) |
| **Backend API** | Node.js & Express.js | REST API routing and CORS control |
| **Real-Time WebSockets** | Socket.io | Bi-directional multi-station event broadcasting |
| **AI Models** | Google Gemini 2.5 Flash & OpenAI GPT-4o | Natural language symptom analysis and ESI parsing |
| **Schema Validation** | Zod | Runtime schema validation for AI JSON output |
| **Database** | MongoDB Mongoose & In-Memory Store | ACID transaction locks + zero-setup memory fallback |

---

## 🔑 Environment Configuration (`.env`)

### 1. Server Configuration (`/server/.env`)

Create `server/.env`:

```env
PORT=5000
MONGODB_URI=
GEMINI_API_KEY=
OPENAI_API_KEY=
CLIENT_ORIGIN=http://localhost:5173
```

- **`GEMINI_API_KEY`**: Your Google Gemini API Key (get free at Google AI Studio). Powers Google Gemini 2.5 Flash AI clinical triage.
- **`OPENAI_API_KEY`**: Your OpenAI API Key (`sk-proj-...`). Optional alternative AI provider.
- **`MONGODB_URI`**: Your MongoDB connection URI (Atlas cloud or local `mongodb://127.0.0.1:27017/medqueue`). If left blank, the app runs on a high-performance in-memory database store with zero setup needed.

### 2. Client Configuration (`/client/.env`)

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_SERVER_URL=http://localhost:5000
```

---

## 🚀 Local Quick Start Guide

```bash
# 1. Start Backend Server (Port 5000)
cd server
npm install
npm run dev

# 2. Start Frontend Client (Port 5173) in a new terminal
cd ../client
npm install
npm run dev
```

Open `http://localhost:5173` in Google Chrome or Microsoft Edge.

---

## 🔗 Repository & Live Deployment Links

- **Live Application**: [https://med-queue-ai.vercel.app/](https://med-queue-ai.vercel.app/)
- **GitHub Repository**: [https://github.com/Samar-111/MedQueue-AI](https://github.com/Samar-111/MedQueue-AI)
