import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Volume2, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function LobbyDisplay({ patients }) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const inConsultation = patients.filter((p) => p.status === 'IN_CONSULTATION');
  const waitingQueue = patients.filter(
    (p) => p.status === 'WAITING' || p.status === 'TRIAGED'
  );

  return (
    <div className="space-y-6">
      
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-teal-100 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl bg-gradient-to-r from-white via-teal-50/50 to-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
            <Tv className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[11px] font-mono font-black text-teal-700 uppercase tracking-widest">Public Waiting Area Display</span>
            </div>
            <h2 className="text-2xl font-black text-slate-800">Emergency Department Live Queue</h2>
          </div>
        </div>

        <div className="flex items-center gap-6 text-right">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-wider block">Local Time</span>
            <span className="font-mono text-xl font-black text-teal-700">{currentTime}</span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase font-black tracking-wider block">Active Waiting</span>
            <span className="font-mono text-xl font-black text-slate-800">{waitingQueue.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-teal-700 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-teal-600 animate-bounce" />
              <span>Now Calling Patient Ticket Number</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono font-bold">Proceed to Assigned Room</span>
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {inConsultation.length > 0 ? (
                inConsultation.map((patient) => (
                  <motion.div
                    key={patient._id || patient.ticketId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass-card p-6 rounded-3xl border border-teal-200 bg-teal-50/60 shadow-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] text-teal-800 font-black uppercase tracking-wider">Ticket Number</span>
                      <h4 className="text-3xl font-black font-mono text-slate-800 mt-0.5">{patient.ticketId}</h4>
                      <p className="text-xs text-slate-500 mt-1 font-semibold">Anonymized Patient Status: In Consultation</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Report To</span>
                      <span className="inline-block px-5 py-2.5 rounded-full btn-primary-gradient text-white font-black text-lg shadow-md mt-1">
                        {patient.roomNumber || 'Exam Room 1'}
                      </span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="glass-card p-12 rounded-3xl border border-slate-200 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-extrabold text-slate-500">No patient tickets currently being called.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Waiting Queue Status ({waitingQueue.length})
            </h3>
            <span className="text-[11px] text-slate-500 font-mono font-bold">Real-Time Rank</span>
          </div>

          <div className="space-y-2.5">
            {waitingQueue.map((patient) => (
              <motion.div
                key={patient._id || patient.ticketId}
                layout
                className="glass-card p-4 rounded-2xl border border-slate-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-mono text-xs font-black flex items-center justify-center">
                    #{patient.rank}
                  </span>
                  <div>
                    <span className="font-mono text-base font-black text-slate-800">{patient.ticketId}</span>
                    <p className="text-[11px] text-slate-500 font-semibold">Triage Tier: Level {patient.esiLevel}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">Est Wait</span>
                    <span className="text-xs font-mono font-bold text-slate-700">~{patient.rank * 10} min</span>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${
                    patient.esiLevel <= 2 ? 'bg-rose-500 animate-ping' : 'bg-teal-500'
                  }`} />
                </div>
              </motion.div>
            ))}

            {waitingQueue.length === 0 && (
              <div className="glass-card p-12 rounded-3xl border border-slate-200 text-center text-slate-400 text-xs font-semibold">
                Queue is clear. No patients waiting.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
