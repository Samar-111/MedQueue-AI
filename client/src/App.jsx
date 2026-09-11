import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import Navbar from './components/Navbar';
import VoiceIntake from './components/VoiceIntake';
import NurseDashboard from './components/NurseDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import LobbyDisplay from './components/LobbyDisplay';
import AnalyticsModal from './components/AnalyticsModal';
import MedicalTechBackground from './components/MedicalTechBackground';
import { socket } from './services/socket';
import { fetchPatients } from './services/api';

export default function App() {
  const [activeView, setActiveView] = useState('intake');
  const [patients, setPatients] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [emergencyNotification, setEmergencyNotification] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('medqueue_theme') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('medqueue_theme', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const loadPatients = async () => {
    try {
      const data = await fetchPatients();
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch initial patients:', err);
    }
  };

  useEffect(() => {
    loadPatients();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    const onQueueUpdated = (newQueue) => {
      setPatients(newQueue);
    };

    const onEmergencyAlert = (alertData) => {
      setEmergencyNotification(alertData);
      setTimeout(() => {
        setEmergencyNotification(null);
      }, 7000);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('queue_updated', onQueueUpdated);
    socket.on('emergency_alert', onEmergencyAlert);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('queue_updated', onQueueUpdated);
      socket.off('emergency_alert', onEmergencyAlert);
    };
  }, []);

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white relative transition-colors duration-300">
      <MedicalTechBackground themeMode={themeMode} />
      
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        isConnected={isConnected}
        patients={patients}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        themeMode={themeMode}
        toggleTheme={toggleTheme}
      />

      <AnimatePresence>
        {emergencyNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl px-4"
          >
            <div className="bg-rose-950/90 border-2 border-rose-500/80 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center animate-ping">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase font-mono text-rose-400">🚨 EMERGENCY PATIENT TRIAGED</span>
                  <h4 className="font-extrabold text-sm text-white">
                    {emergencyNotification.name} ({emergencyNotification.ticketId}) - ESI Level {emergencyNotification.esiLevel}
                  </h4>
                  <p className="text-xs text-rose-200 mt-0.5">{emergencyNotification.chiefComplaint}</p>
                </div>
              </div>
              <button
                onClick={() => setEmergencyNotification(null)}
                className="text-rose-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'intake' && <VoiceIntake onPatientAdded={loadPatients} />}
        {activeView === 'nurse' && <NurseDashboard patients={patients} isConnected={isConnected} />}
        {activeView === 'doctor' && <DoctorDashboard patients={patients} isConnected={isConnected} />}
        {activeView === 'lobby' && <LobbyDisplay patients={patients} />}
      </main>

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        patients={patients}
      />

      <footer className="w-full glass-panel border-t border-slate-900 px-6 py-4 mt-8 text-center text-xs text-slate-500">
        <p>MedQueue AI • Real-Time Emergency Intake Engine & Atomic Triage System</p>
      </footer>
    </div>
  );
}
