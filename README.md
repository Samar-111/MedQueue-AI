# MedQueue AI - Real-Time ER Voice Triage & Atomic Queue Engine

MedQueue AI is an intelligent clinical intake platform designed to eliminate emergency room overcrowding by replacing static paper intake with AI-driven voice triage, instant disease chips, and atomic queue re-ordering.

---

## 🔑 Environment Configuration (`.env`)

### 1. Server Configuration (`/server/.env`)

Create or update `server/.env` with your settings:

```env
PORT=5000
MONGODB_URI=
OPENAI_API_KEY=
CLIENT_ORIGIN=http://localhost:5173
```

- **`OPENAI_API_KEY`**: Your OpenAI API Key (`sk-proj-...`). Powers GPT-4o AI clinical triage, ESI 1-5 level classification, and red-flag identification. If left blank, the app uses an internal rule-based triage engine automatically.
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

---

## 🌐 Production Deployment Guide

### Option 1: Render / Railway Deployment (Recommended)

#### Backend Deployment (Render / Railway Web Service)
1. Push your repository to GitHub.
2. Create a new **Web Service** on Render or Railway connected to your repository.
3. Set **Root Directory** to `server`.
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Set Environment Variables on Render/Railway:
   - `PORT`: `5000` (or dynamically supplied port)
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `MONGODB_URI`: Your MongoDB Atlas URI
   - `CLIENT_ORIGIN`: Your deployed frontend URL (e.g. `https://your-app.vercel.app`)

#### Frontend Deployment (Vercel / Netlify / Render Static Site)
1. Create a new project on Vercel or Netlify connected to your GitHub repository.
2. Set **Root Directory** to `client`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Set Environment Variables:
   - `VITE_API_BASE_URL`: Your deployed backend URL (e.g. `https://your-backend.onrender.com`)
   - `VITE_SOCKET_SERVER_URL`: Your deployed backend URL (e.g. `https://your-backend.onrender.com`)

---

### Option 2: Unified Monorepo Deployment (Single Server)

You can serve the static frontend bundle directly from the Express backend server:

1. Build the client bundle:
   ```bash
   cd client
   npm run build
   ```
2. Copy `client/dist` contents to `server/public` or configure Express static serving in `server/index.js`:
   ```javascript
   import path from 'path';
   app.use(express.static(path.join(process.cwd(), '../client/dist')));
   app.get('*', (req, res) => {
     res.sendFile(path.join(process.cwd(), '../client/dist/index.html'));
   });
   ```
3. Deploy the `server` directory to any Node.js host (Heroku, AWS Elastic Beanstalk, DigitalOcean App Platform, Fly.io, or VPS).

---

### Option 3: Docker Container Deployment

Create a `Dockerfile` in the root directory:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production
COPY client/package*.json ./client/
RUN cd client && npm install && npm run build
COPY . .
EXPOSE 5000
CMD ["node", "server/index.js"]
```

Build and run:
```bash
docker build -t medqueue-ai .
docker run -p 5000:5000 -e OPENAI_API_KEY=sk-proj-... medqueue-ai
```
