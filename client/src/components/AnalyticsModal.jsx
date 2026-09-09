import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, Activity, ShieldAlert, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function AnalyticsModal({ isOpen, onClose, patients }) {
  if (!isOpen) return null;

  const totalPatients = patients.length;
  const criticalCount = patients.filter((p) => p.esiLevel <= 2).length;
  const completedCount = patients.filter((p) => p.status === 'COMPLETED' || p.status === 'TRANSFERRED').length;
  const activeCount = patients.filter((p) => p.status === 'WAITING' || p.status === 'TRIAGED' || p.status === 'IN_CONSULTATION').length;

  const esiCounts = {
    1: patients.filter((p) => p.esiLevel === 1).length,
    2: patients.filter((p) => p.esiLevel === 2).length,
    3: patients.filter((p) => p.esiLevel === 3).length,
    4: patients.filter((p) => p.esiLevel === 4).length,
    5: patients.filter((p) => p.esiLevel === 5).length
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-card w-full max-w-3xl p-6 sm:p-8 rounded-3xl border border-teal-200 space-y-6 shadow-2xl relative bg-white/98 text-slate-800"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800">Clinical Intake Telemetry & Analytics</h3>
            <p className="text-xs text-slate-500 font-semibold">Real-time emergency queue throughput and ESI breakdown.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider block">Total Intakes</span>
            <span className="font-mono text-2xl font-black text-slate-800 mt-1 block">{totalPatients}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] text-rose-600 font-black uppercase tracking-wider block">Critical (ESI 1-2)</span>
            <span className="font-mono text-2xl font-black text-rose-600 mt-1 block">{criticalCount}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] text-teal-700 font-black uppercase tracking-wider block">Currently Active</span>
            <span className="font-mono text-2xl font-black text-teal-700 mt-1 block">{activeCount}</span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
            <span className="text-[10px] text-emerald-700 font-black uppercase tracking-wider block">Discharged / Treated</span>
            <span className="font-mono text-2xl font-black text-emerald-700 mt-1 block">{completedCount}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            ESI Severity Distribution
          </h4>
          <div className="space-y-2.5">
            {[
              { level: 1, label: 'ESI 1 - Resuscitation', count: esiCounts[1], color: 'bg-rose-500' },
              { level: 2, label: 'ESI 2 - Emergent', count: esiCounts[2], color: 'bg-orange-500' },
              { level: 3, label: 'ESI 3 - Urgent', count: esiCounts[3], color: 'bg-amber-500' },
              { level: 4, label: 'ESI 4 - Less Urgent', count: esiCounts[4], color: 'bg-teal-600' },
              { level: 5, label: 'ESI 5 - Non-Urgent', count: esiCounts[5], color: 'bg-emerald-600' }
            ].map((item) => {
              const percentage = totalPatients > 0 ? Math.round((item.count / totalPatients) * 100) : 0;
              return (
                <div key={item.level} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-mono">{item.count} patients ({percentage}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full ${item.color} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-slate-100 text-slate-700 font-black text-xs hover:bg-slate-200 transition-colors"
          >
            Close Telemetry View
          </button>
        </div>
      </motion.div>
    </div>
  );
}
