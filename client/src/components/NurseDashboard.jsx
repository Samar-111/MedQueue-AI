import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Edit3, 
  CheckCircle, 
  AlertCircle, 
  Heart, 
  Thermometer, 
  Zap,
  ArrowUpRight,
  Sparkles,
  Search,
  Filter,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { updatePatientStatus, overridePatientESI } from '../services/api';

export default function NurseDashboard({ patients, isConnected }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editVitals, setEditVitals] = useState(null);
  const [overrideESI, setOverrideESI] = useState(null);
  const [nurseNoteText, setNurseNoteText] = useState('');
  const [assignedRoom, setAssignedRoom] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterESI, setFilterESI] = useState('ALL');

  const activeQueue = patients.filter(
    (p) => p.status === 'WAITING' || p.status === 'TRIAGED'
  );

  const filteredQueue = activeQueue.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.chiefComplaint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesESI = filterESI === 'ALL' || p.esiLevel === Number(filterESI);
    return matchesSearch && matchesESI;
  });

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient);
    setEditVitals(patient.vitals || { heartRate: 75, bloodPressure: '120/80', oxygenSat: 98, temperature: 98.6 });
    setOverrideESI(patient.esiLevel);
    setNurseNoteText(patient.nurseNotes || '');
    setAssignedRoom(patient.roomNumber || '');
  };

  const handleSaveTriage = async () => {
    if (!selectedPatient) return;
    try {
      if (overrideESI !== selectedPatient.esiLevel) {
        await overridePatientESI(selectedPatient._id || selectedPatient.ticketId, {
          esiLevel: Number(overrideESI),
          nurseNotes: nurseNoteText
        });
      }

      await updatePatientStatus(selectedPatient._id || selectedPatient.ticketId, {
        status: 'TRIAGED',
        roomNumber: assignedRoom.trim() || null,
        nurseNotes: nurseNoteText
      });

      setSelectedPatient(null);
    } catch (err) {
      console.error('Nurse update error:', err);
    }
  };

  const handleSendToConsultation = async (patient) => {
    try {
      await updatePatientStatus(patient._id || patient.ticketId, {
        status: 'IN_CONSULTATION',
        roomNumber: patient.roomNumber || 'Exam Room 1'
      });
      if (selectedPatient?._id === patient._id) setSelectedPatient(null);
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const getEsiBadgeStyle = (level) => {
    switch (level) {
      case 1:
        return 'bg-rose-600 text-white animate-pulse border-rose-300 font-black shadow-md';
      case 2:
        return 'bg-orange-500 text-white border-orange-300 font-black shadow-sm';
      case 3:
        return 'bg-amber-500 text-white font-black';
      case 4:
        return 'bg-teal-600 text-white font-black';
      default:
        return 'bg-emerald-600 text-white font-black';
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Nurse Command & Triage Station</h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Atomic patient queue triage, vital sign telemetry, and ESI level escalation.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-full border border-slate-200 shadow-inner">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter Ticket / Patient / Complaint..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 placeholder-slate-400 outline-none w-48"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-full border border-slate-200 shadow-inner">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 ml-2 mr-1" />
            {['ALL', 1, 2, 3, 4, 5].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterESI(lvl)}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all ${
                  filterESI === lvl
                    ? 'btn-primary-gradient text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl === 'ALL' ? 'ALL' : `ESI ${lvl}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-teal-600" />
              <span>Live Atomic Re-Ordering Priority Queue ({filteredQueue.length} Active Patients)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono font-bold">Sorted Atomically by ESI Severity</span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {filteredQueue.length > 0 ? (
                filteredQueue.map((patient) => (
                  <motion.div
                    key={patient._id || patient.ticketId}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`glass-card p-5 rounded-3xl border transition-all cursor-pointer ${
                      patient.esiLevel <= 2
                        ? 'esi-halo-1 bg-rose-50/50 border-rose-200'
                        : selectedPatient?._id === patient._id
                        ? 'border-teal-400 bg-white shadow-xl ring-2 ring-teal-200'
                        : 'border-teal-100 hover:border-teal-200'
                    }`}
                    onClick={() => handleSelectPatient(patient)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border ${getEsiBadgeStyle(patient.esiLevel)}`}>
                          <span className="text-[9px] uppercase font-mono tracking-wider">RANK</span>
                          <span className="text-xl font-black font-mono">#{patient.rank}</span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-800 text-base">{patient.name}</span>
                            <span className="text-xs text-slate-500 font-semibold">({patient.age}y / {patient.gender})</span>
                          </div>
                          <p className="text-xs text-slate-700 font-bold mt-1">{patient.chiefComplaint}</p>
                          
                          {patient.redFlags && patient.redFlags.length > 0 && patient.redFlags[0] !== 'None Detected' && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {patient.redFlags.map((flag, idx) => (
                                <span key={idx} className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800">
                                  🚨 {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            patient.status === 'TRIAGED' ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {patient.status}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono font-bold">Est: {patient.estimatedTimeMinutes || 15}m</p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendToConsultation(patient);
                          }}
                          className="btn-primary-gradient px-4 py-2 rounded-full text-white text-xs font-black flex items-center gap-1"
                        >
                          <span>Assign Room</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="glass-card p-12 rounded-3xl text-center border border-slate-200">
                  <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm font-semibold">No active queue patients match the selected filter.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div>
          {selectedPatient ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-6 rounded-3xl border border-teal-200 sticky top-24 space-y-5 bg-white/95 shadow-xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-800">{selectedPatient.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">
                  Manual ESI Escalation Override
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setOverrideESI(lvl)}
                      className={`py-2 rounded-xl text-xs font-black border transition-all ${
                        overrideESI === lvl
                          ? getEsiBadgeStyle(lvl)
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      ESI {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-2">Vital Signs Telemetry</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-extrabold flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Heart Rate
                    </span>
                    <input
                      type="number"
                      value={editVitals.heartRate}
                      onChange={(e) => setEditVitals({ ...editVitals, heartRate: Number(e.target.value) })}
                      className="w-full bg-transparent text-base font-black text-slate-800 outline-none mt-1 font-mono"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-extrabold flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-teal-600" /> Blood Pressure
                    </span>
                    <input
                      type="text"
                      value={editVitals.bloodPressure}
                      onChange={(e) => setEditVitals({ ...editVitals, bloodPressure: e.target.value })}
                      className="w-full bg-transparent text-base font-black text-slate-800 outline-none mt-1 font-mono"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-extrabold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" /> SpO2 (%)
                    </span>
                    <input
                      type="number"
                      value={editVitals.oxygenSat}
                      onChange={(e) => setEditVitals({ ...editVitals, oxygenSat: Number(e.target.value) })}
                      className="w-full bg-transparent text-base font-black text-slate-800 outline-none mt-1 font-mono"
                    />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-extrabold flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temp (°F)
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={editVitals.temperature}
                      onChange={(e) => setEditVitals({ ...editVitals, temperature: Number(e.target.value) })}
                      className="w-full bg-transparent text-base font-black text-slate-800 outline-none mt-1 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Assign Room / Bed</label>
                <input
                  type="text"
                  placeholder="e.g. Trauma Bay 2 or Room 104"
                  value={assignedRoom}
                  onChange={(e) => setAssignedRoom(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider block mb-1">Nurse Assessment Notes</label>
                <textarea
                  rows={3}
                  value={nurseNoteText}
                  onChange={(e) => setNurseNoteText(e.target.value)}
                  placeholder="Record additional clinical observations, allergy warnings..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-sans font-semibold"
                />
              </div>

              <button
                onClick={handleSaveTriage}
                className="btn-primary-gradient w-full py-3 rounded-full text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Confirm Nurse Assessment</span>
              </button>
            </motion.div>
          ) : (
            <div className="glass-card p-8 rounded-3xl border border-slate-200 text-center text-slate-400 sticky top-24">
              <Edit3 className="w-10 h-10 mx-auto mb-3 opacity-40 text-teal-600" />
              <p className="text-xs font-extrabold text-slate-500">Select a patient from the atomic queue to inspect clinical telemetry or escalate ESI tier.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
