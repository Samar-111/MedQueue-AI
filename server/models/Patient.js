import mongoose from 'mongoose';

const PatientSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true },
    name: { type: String, required: true, default: 'Anonymous Patient' },
    age: { type: Number, default: 35 },
    gender: { type: String, default: 'Unspecified' },
    language: { type: String, default: 'en-US' },
    rawTranscript: { type: String, required: true },
    translatedSummary: { type: String, required: true },
    chiefComplaint: { type: String, required: true },
    esiLevel: { type: Number, required: true, min: 1, max: 5 },
    redFlags: [{ type: String }],
    triageRationale: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    estimatedTimeMinutes: { type: Number, default: 15 },
    rank: { type: Number, required: true, default: 999 },
    status: {
      type: String,
      enum: ['WAITING', 'TRIAGED', 'IN_CONSULTATION', 'COMPLETED', 'TRANSFERRED'],
      default: 'WAITING'
    },
    roomNumber: { type: String, default: null },
    vitals: {
      heartRate: { type: Number, default: 72 },
      bloodPressure: { type: String, default: '120/80' },
      oxygenSat: { type: Number, default: 98 },
      temperature: { type: Number, default: 98.6 }
    },
    nurseNotes: { type: String, default: '' },
    doctorNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

export const Patient = mongoose.model('Patient', PatientSchema);
