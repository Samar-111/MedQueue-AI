import React from 'react';
import { 
  Activity, 
  Mic, 
  Stethoscope, 
  UserCheck, 
  Tv, 
  BarChart3, 
  ShieldAlert,
  Sun
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  patients, 
  onOpenAnalytics 
}) {
  const criticalCount = patients.filter(p => p.esiLevel <= 2 && (p.status === 'WAITING' || p.status === 'TRIAGED')).length;

  const views = [
    { id: 'intake', label: 'Voice Intake Kiosk', icon: Mic, badge: null },
    { id: 'nurse', label: 'Nurse Station', icon: UserCheck, badge: patients.filter(p => p.status === 'WAITING' || p.status === 'TRIAGED').length },
    { id: 'doctor', label: 'Doctor Workbench', icon: Stethoscope, badge: patients.filter(p => p.status === 'IN_CONSULTATION').length },
    { id: 'lobby', label: 'Lobby Board', icon: Tv, badge: null }
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto glass-dock rounded-full px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('intake')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Sun className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              <span>MedQueue</span>
              <span className="text-orange-500 font-black">AI</span>
            </h1>
            <p className="text-[11px] text-slate-300 font-extrabold mt-0.5 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">Emergency Intake & Priority Queue</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 sm:gap-2 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-full border border-slate-700/80 shadow-2xl ring-1 ring-white/10">
          {views.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'pulse-buffer-btn text-white shadow-lg scale-[1.02] ring-1 ring-orange-400/50'
                    : 'bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 hover:border-cyan-400/60 text-white hover:scale-[1.02] shadow-sm'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]'}`} />
                <span className="tracking-tight text-white font-extrabold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {tab.label}
                </span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-orange-600 shadow-sm' : 'bg-cyan-500 text-slate-950 font-black shadow-sm'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-950/90 border border-rose-500/80 text-white text-xs font-black shadow-sm animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{criticalCount} Urgent Priority</span>
            </div>
          )}

          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 hover:border-orange-400/60 text-xs font-extrabold text-white transition-all duration-200 hover:scale-105 shadow-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
          >
            <BarChart3 className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>
        </div>

      </div>
    </header>
  );
}
