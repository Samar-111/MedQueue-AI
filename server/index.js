import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { analyzeTriage } from './services/aiTriage.js';
import {
  getAllPatients,
  createPatientRecord,
  updatePatientStatus,
  reorderQueue
} from './controllers/queueController.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: '*' }));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

await connectDB();

async function seedInitialData() {
  const existing = await getAllPatients();
  if (existing.length === 0) {
    const samples = [
      {
        name: 'Rajesh Sharma',
        age: 42,
        gender: 'Male',
        language: 'en-US',
        rawTranscript: 'I feel sharp crushing chest pain radiating to my left arm and jaw for 20 minutes.',
        triage: {
          translatedSummary: 'Patient reports severe acute substernal chest pain radiating to left upper extremity and jaw.',
          chiefComplaint: 'Acute Radiating Chest Pain',
          esiLevel: 1,
          redFlags: ['CARDIAC', 'CHEST PAIN', 'RADIATING PAIN'],
          triageRationale: 'High concern for ST-elevation myocardial infarction. Immediate resuscitation status.',
          recommendedAction: 'Immediate ECG, Stat Troponin, Resuscitation Bay 1.',
          estimatedTimeMinutes: 45
        },
        vitals: { heartRate: 118, bloodPressure: '165/95', oxygenSat: 94, temperature: 98.8 }
      },
      {
        name: 'Vikram Patel',
        age: 28,
        gender: 'Male',
        language: 'en-US',
        rawTranscript: 'Deep laceration on right forearm from broken glass, active bleeding requiring pressure.',
        triage: {
          translatedSummary: 'Deep 8cm right forearm laceration with arterial hemorrhage controlled by direct pressure.',
          chiefComplaint: 'Severe Forearm Laceration & Hemorrhage',
          esiLevel: 2,
          redFlags: ['ACTIVE BLEEDING', 'LACERATION'],
          triageRationale: 'Emergent vascular evaluation needed to prevent rapid blood loss.',
          recommendedAction: 'Pressure dressing, vascular consult, Bed 4.',
          estimatedTimeMinutes: 30
        },
        vitals: { heartRate: 92, bloodPressure: '128/82', oxygenSat: 99, temperature: 98.4 }
      },
      {
        name: 'Priya Verma',
        age: 34,
        gender: 'Female',
        language: 'hi-IN',
        rawTranscript: 'Mujhe tez bukhar hai aur pet me bahut dard ho raha hai.',
        triage: {
          translatedSummary: 'High fever 39C (102.2F) with acute abdominal pain and nausea for 24h.',
          chiefComplaint: 'Febrile Abdominal Pain',
          esiLevel: 3,
          redFlags: ['HIGH FEVER'],
          triageRationale: 'Urgent evaluation. Requires ultrasound and blood lab panel.',
          recommendedAction: 'Standard queue placement, nurse triage assessment within 15 minutes.',
          estimatedTimeMinutes: 20
        },
        vitals: { heartRate: 88, bloodPressure: '118/76', oxygenSat: 97, temperature: 102.2 }
      }
    ];

    for (const sample of samples) {
      await createPatientRecord(sample, null);
    }
  }
}

await seedInitialData();

app.get('/api/health', (req, res) => {
  res.json({ status: 'online', service: 'MedQueue AI Triage Engine' });
});

app.post('/api/triage/analyze', async (req, res) => {
  try {
    const { transcript, language } = req.body;
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }
    const result = await analyzeTriage(transcript, language || 'en-US');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await getAllPatients();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patientData = req.body;
    if (!patientData.rawTranscript || !patientData.triage) {
      return res.status(400).json({ error: 'Missing transcript or triage data' });
    }
    const created = await createPatientRecord(patientData, io);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/patients/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, roomNumber, nurseNotes, doctorNotes } = req.body;
    const updated = await updatePatientStatus(id, { status, roomNumber, nurseNotes, doctorNotes }, io);
    if (!updated) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/patients/:id/override', async (req, res) => {
  try {
    const { id } = req.params;
    const { esiLevel, nurseNotes } = req.body;
    const updated = await updatePatientStatus(id, { esiLevel, nurseNotes }, io);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on('connection', async (socket) => {
  console.log('[Socket.io] Client connected:', socket.id);
  const queue = await getAllPatients();
  socket.emit('queue_updated', queue);

  socket.on('request_queue', async () => {
    const q = await getAllPatients();
    socket.emit('queue_updated', q);
  });

  socket.on('disconnect', () => {
    console.log('[Socket.io] Client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`[MedQueue Server] Running on http://localhost:${PORT}`);
});
