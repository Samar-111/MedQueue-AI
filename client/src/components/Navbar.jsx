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
      <div className="max-w-7xl mx-auto glass-dock rounded-full px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('intake')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Sun className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-indigo-950 flex items-center gap-1">
              <span>MedQueue</span>
              <span className="text-orange-600 font-black">AI</span>
            </h1>
            <p className="text-[11px] text-stone-600 font-bold mt-0.5">Emergency Intake & Priority Queue</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 bg-amber-50/80 p-1.5 rounded-full border border-amber-200 shadow-inner">
          {views.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all duration-200 ${
                  isActive
                    ? 'pulse-buffer-btn text-white shadow-md scale-[1.02]'
                    : 'text-stone-700 hover:text-indigo-950 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-orange-600' : 'bg-amber-200 text-amber-900'
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
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-100 border border-pink-300 text-pink-900 text-xs font-black shadow-sm animate-pulse">
              <ShieldAlert className="w-4 h-4 text-pink-600" />
              <span>{criticalCount} Urgent Priority</span>
            </div>
          )}

          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-2 px-4 py-2 rounded-full sunny-card-hover text-xs font-bold text-stone-800 hover:text-orange-600"
          >
            <BarChart3 className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>
        </div>

      </div>
    </header>
  );
}
