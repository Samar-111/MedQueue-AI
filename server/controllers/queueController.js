import { Patient } from '../models/Patient.js';
import { getDBStatus, getMemoryStore, setMemoryStore } from '../config/db.js';

let counter = 101;

export async function reorderQueue(io) {
  const isMongo = getDBStatus();

  if (isMongo) {
    const session = await Patient.startSession();
    try {
      session.startTransaction();

      const activePatients = await Patient.find({
        status: { $in: ['WAITING', 'TRIAGED'] }
      })
        .sort({ esiLevel: 1, createdAt: 1 })
        .session(session);

      for (let i = 0; i < activePatients.length; i++) {
        activePatients[i].rank = i + 1;
        await activePatients[i].save({ session });
      }

      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      console.error('[Atomic Queue Reorder Error]:', err);
    }
  } else {
    let store = getMemoryStore();
    const active = store
      .filter((p) => p.status === 'WAITING' || p.status === 'TRIAGED')
      .sort((a, b) => {
        if (a.esiLevel !== b.esiLevel) return a.esiLevel - b.esiLevel;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    const inactive = store.filter((p) => p.status !== 'WAITING' && p.status !== 'TRIAGED');

    active.forEach((patient, index) => {
      patient.rank = index + 1;
    });

    setMemoryStore([...active, ...inactive]);
  }

  if (io) {
    const allQueue = await getAllPatients();
    io.emit('queue_updated', allQueue);
  }
}

export async function getAllPatients() {
  if (getDBStatus()) {
    return await Patient.find().sort({ rank: 1, createdAt: 1 });
  } else {
    const store = getMemoryStore();
    return [...store].sort((a, b) => a.rank - b.rank);
  }
}

export async function createPatientRecord(data, io) {
  const ticketId = `MQ-${counter++}`;
  const now = new Date().toISOString();

  const patientObj = {
    ticketId,
    name: data.name || `Patient #${counter}`,
    age: Number(data.age) || 35,
    gender: data.gender || 'Unspecified',
    language: data.language || 'en-US',
    rawTranscript: data.rawTranscript,
    translatedSummary: data.triage.translatedSummary,
    chiefComplaint: data.triage.chiefComplaint,
    esiLevel: data.triage.esiLevel,
    redFlags: data.triage.redFlags || [],
    triageRationale: data.triage.triageRationale,
    recommendedAction: data.triage.recommendedAction,
    estimatedTimeMinutes: data.triage.estimatedTimeMinutes || 15,
    rank: 999,
    status: 'WAITING',
    vitals: data.vitals || {
      heartRate: 75,
      bloodPressure: '120/80',
      oxygenSat: 98,
      temperature: 98.6
    },
    createdAt: now,
    updatedAt: now
  };

  let createdPatient;

  if (getDBStatus()) {
    createdPatient = new Patient(patientObj);
    await createdPatient.save();
  } else {
    createdPatient = { ...patientObj, _id: `mem_${Date.now()}_${Math.random()}` };
    const store = getMemoryStore();
    store.push(createdPatient);
    setMemoryStore(store);
  }

  await reorderQueue(io);

  if (io && createdPatient.esiLevel <= 2) {
    io.emit('emergency_alert', {
      ticketId: createdPatient.ticketId,
      name: createdPatient.name,
      esiLevel: createdPatient.esiLevel,
      chiefComplaint: createdPatient.chiefComplaint,
      redFlags: createdPatient.redFlags
    });
  }

  return createdPatient;
}

export async function updatePatientStatus(id, updateData, io) {
  let updated;

  if (getDBStatus()) {
    updated = await Patient.findByIdAndUpdate(id, updateData, { new: true });
  } else {
    const store = getMemoryStore();
    const idx = store.findIndex((p) => p._id.toString() === id.toString() || p.ticketId === id);
    if (idx !== -1) {
      store[idx] = { ...store[idx], ...updateData, updatedAt: new Date().toISOString() };
      setMemoryStore(store);
      updated = store[idx];
    }
  }

  await reorderQueue(io);

  if (io && updated) {
    io.emit('patient_updated', updated);
  }

  return updated;
}

export async function updatePatientVitals(id, vitals, io) {
  let patient;
  if (getDBStatus()) {
    patient = await Patient.findById(id);
    if (!patient) patient = await Patient.findOne({ ticketId: id });
  } else {
    const store = getMemoryStore();
    patient = store.find((p) => p._id.toString() === id.toString() || p.ticketId === id);
  }

  if (!patient) return null;

  const currentEsi = patient.esiLevel;
  let newEsi = currentEsi;
  const reasons = [];

  const heartRate = Number(vitals.heartRate);
  const oxygenSat = Number(vitals.oxygenSat);
  const sysBp = vitals.bloodPressure ? parseInt(vitals.bloodPressure.split('/')[0]) : NaN;

  if (oxygenSat < 90) {
    newEsi = 1;
    reasons.push(`Critical Hypoxia (SpO2: ${oxygenSat}% < 90%)`);
  } else if (oxygenSat < 94 && newEsi > 2) {
    newEsi = 2;
    reasons.push(`Moderate Hypoxia (SpO2: ${oxygenSat}%)`);
  }

  if (heartRate > 130) {
    newEsi = 1;
    reasons.push(`Severe Tachycardia (HR: ${heartRate} bpm > 130)`);
  } else if ((heartRate > 115 || heartRate < 45) && newEsi > 2) {
    newEsi = 2;
    reasons.push(`Abnormal Heart Rate Telemetry (HR: ${heartRate} bpm)`);
  }

  if (!isNaN(sysBp) && sysBp < 90) {
    if (newEsi > 1) newEsi = 1;
    reasons.push(`Severe Hypotension (Systolic BP: ${sysBp} mmHg < 90)`);
  }

  const isEscalated = newEsi < currentEsi;
  const updatePayload = {
    vitals,
    ...(isEscalated
      ? {
          esiLevel: newEsi,
          previousEsiLevel: currentEsi,
          isEscalated: true,
          escalationReason: reasons.join(' | ')
        }
      : {})
  };

  const updated = await updatePatientStatus(id, updatePayload, io);

  if (isEscalated && io && updated) {
    io.emit('emergency_escalation', {
      patient: updated,
      previousEsiLevel: currentEsi,
      newEsiLevel: newEsi,
      reason: reasons.join(' | ')
    });
  }

  return updated;
}
