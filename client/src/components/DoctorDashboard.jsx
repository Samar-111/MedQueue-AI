import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Stethoscope, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Heart, 
  Activity, 
  Thermometer, 
  Zap, 
  User, 
  Send,
  Sparkles,
  ArrowRight,
  LogOut,
  Building2
} from 'lucide-react';
import { updatePatientStatus } from '../services/api';

export default function DoctorDashboard({ patients, isConnected }) {
  const [activeConsultation, setActiveConsultation] = useState(null);
  const [doctorNotesText, setDoctorNotesText] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const consultationPatients = patients.filter((p) => p.status === 'IN_CONSULTATION');
  const readyPatients = patients.filter(
    (p) => p.status === 'WAITING' || p.status === 'TRIAGED'
  );

  useEffect(() => {
    if (consultationPatients.length > 0 && !activeConsultation) {
      setActiveConsultation(consultationPatients[0]);
    }
  }, [consultationPatients]);

  useEffect(() => {
    let timer;
    if (activeConsultation) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [activeConsultation]);

  const handleCallNext = async () => {
    if (readyPatients.length === 0) return;
    const nextPatient = readyPatients[0];
    try {
      const updated = await updatePatientStatus(nextPatient._id || nextPatient.ticketId, {
        status: 'IN_CONSULTATION',
        roomNumber: 'Exam Room 1'
      });
      setActiveConsultation(updated);
      setElapsedSeconds(0);
      setDoctorNotesText('');
    } catch (err) {
      console.error('Call patient error:', err);
    }
  };

  const handleCompleteConsultation = async (finalStatus) => {
    if (!activeConsultation) return;
    try {
      await updatePatientStatus(activeConsultation._id || activeConsultation.ticketId, {
        status: finalStatus,
        doctorNotes: doctorNotesText
      });
      setActiveConsultation(null);
      setDoctorNotesText('');
    } catch (err) {
      console.error('Complete error:', err);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Physician Workbench & Clinical Brief</h2>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Synthesized AI clinical telemetry, red-flag analysis, and active consultation timer.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {readyPatients.length > 0 && (
            <button
              onClick={handleCallNext}
              className="btn-coral-gradient px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Call Next Priority Patient (#{readyPatients[0]?.rank})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">
              In Consultation ({consultationPatients.length})
            </h3>
          </div>

          <div className="space-y-3">
            {consultationPatients.map((p) => (
              <div
                key={p._id || p.ticketId}
                onClick={() => {
                  setActiveConsultation(p);
                  setDoctorNotesText(p.doctorNotes || '');
                }}
                className={`glass-card p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeConsultation?._id === p._id
                    ? 'border-teal-400 bg-white shadow-lg ring-2 ring-teal-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs text-teal-700 font-bold">{p.ticketId}</span>
                    <h4 className="font-black text-slate-800 text-sm">{p.name}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black border border-teal-200">
                    {p.roomNumber || 'Exam Room'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-1 font-semibold">{p.chiefComplaint}</p>
              </div>
            ))}

            {consultationPatients.length === 0 && (
              <div className="glass-card p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs font-semibold">
                No active consultation. Click "Call Next Priority Patient" to begin.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-3">Up Next Priority Queue</h3>
            <div className="space-y-2">
              {readyPatients.slice(0, 4).map((p) => (
                <div key={p._id || p.ticketId} className="glass-card p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-mono text-[10px] flex items-center justify-center font-bold">
                      #{p.rank}
                    </span>
                    <span className="font-bold text-slate-800">{p.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    p.esiLevel <= 2 ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    ESI {p.esiLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {activeConsultation ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-200 space-y-6 shadow-xl bg-white/95"
            >
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-teal-800 font-bold px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200">
                      {activeConsultation.ticketId}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">{activeConsultation.roomNumber || 'Exam Room'}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mt-1.5">{activeConsultation.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{activeConsultation.age} yrs • {activeConsultation.gender} • Language: {activeConsultation.language}</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <Clock className="w-5 h-5 text-teal-600 animate-pulse" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider block">Consultation Stopwatch</span>
                    <span className="font-mono text-xl font-black text-slate-800">{formatTime(elapsedSeconds)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-black uppercase flex items-center justify-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Heart Rate
                  </span>
                  <p className="text-lg font-black text-slate-800 mt-0.5 font-mono">{activeConsultation.vitals?.heartRate || 72} <span className="text-xs text-slate-400">BPM</span></p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-black uppercase flex items-center justify-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-teal-600" /> Blood Press
                  </span>
                  <p className="text-lg font-black text-slate-800 mt-0.5 font-mono">{activeConsultation.vitals?.bloodPressure || '120/80'}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-black uppercase flex items-center justify-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-emerald-600" /> SpO2
                  </span>
                  <p className="text-lg font-black text-slate-800 mt-0.5 font-mono">{activeConsultation.vitals?.oxygenSat || 98}%</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-black uppercase flex items-center justify-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp
                  </span>
                  <p className="text-lg font-black text-slate-800 mt-0.5 font-mono">{activeConsultation.vitals?.temperature || 98.6}°F</p>
                </div>
              </div>

              <div className="space-y-4 bg-teal-50/60 p-5 rounded-2xl border border-teal-100">
                <div>
                  <h4 className="text-xs font-black text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-teal-600" /> AI Synthesized Clinical Summary
                  </h4>
                  <p className="text-xs text-slate-800 leading-relaxed font-bold">
                    {activeConsultation.translatedSummary}
                  </p>
                </div>

                {activeConsultation.rawTranscript && (
                  <div>
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Original Patient Transcript</h5>
                    <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200 font-semibold">
                      "{activeConsultation.rawTranscript}"
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Triage Protocol & Rationale</h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {activeConsultation.triageRationale}
                    </p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1">Nurse Clinical Notes</h5>
                    <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 font-semibold">
                      {activeConsultation.nurseNotes || 'No additional nurse notes recorded.'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">
                  Physician Consultation & Discharge Notes
                </label>
                <textarea
                  rows={3}
                  value={doctorNotesText}
                  onChange={(e) => setDoctorNotesText(e.target.value)}
                  placeholder="Record diagnosis, prescribed medications, follow-up instructions..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-sans"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleCompleteConsultation('TRANSFERRED')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-black text-xs hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Transfer / Admit Patient</span>
                </button>

                <button
                  onClick={() => handleCompleteConsultation('COMPLETED')}
                  className="btn-primary-gradient w-full sm:w-auto px-7 py-2.5 rounded-full text-white font-black text-xs flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Discharge Patient & Complete</span>
                </button>
              </div>

            </motion.div>
          ) : (
            <div className="glass-card p-16 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-4">
              <Stethoscope className="w-12 h-12 mx-auto text-teal-600/40" />
              <h3 className="text-base font-black text-slate-700">No Patient Selected for Consultation</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-semibold">Select a patient from the queue or click "Call Next Priority Patient" to inspect clinical telemetry.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
