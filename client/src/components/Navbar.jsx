import React from 'react';
import { 
  Activity, 
  Mic, 
  Stethoscope, 
  UserCheck, 
  Tv, 
  BarChart3, 
  ShieldAlert,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({ 
  activeView, 
  setActiveView, 
  patients, 
  onOpenAnalytics,
  themeMode,
  toggleTheme
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
      <div className="max-w-7xl mx-auto glass-dock rounded-full px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView('intake')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Sun className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
              <span>MedQueue</span>
              <span className="text-orange-600 dark:text-orange-500 font-black">AI</span>
            </h1>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold mt-0.5">Emergency Intake & Priority Queue</p>
          </div>
        </div>

        <nav className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-inner">
          {views.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'pulse-buffer-btn text-white shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:scale-[1.02] shadow-sm'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} />
                <span className={`tracking-tight font-extrabold ${isActive ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                  {tab.label}
                </span>
                {tab.badge !== null && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-orange-600 shadow-sm' : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-black shadow-sm'
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
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-black shadow-sm animate-pulse">
              <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>{criticalCount} Urgent Priority</span>
            </div>
          )}

          <button
            onClick={toggleTheme}
            title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Night Mode'}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:text-orange-600 dark:hover:text-amber-400 transition-all duration-200 hover:scale-105 shadow-sm cursor-pointer"
          >
            {themeMode === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-ultra-slow" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">Night Mode</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenAnalytics}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-extrabold text-slate-800 dark:text-slate-100 hover:text-orange-600 dark:hover:text-amber-400 transition-all duration-200 hover:scale-105 shadow-sm cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-orange-500" />
            <span className="hidden sm:inline">Telemetry</span>
          </button>
        </div>

      </div>
    </header>
  );
}
