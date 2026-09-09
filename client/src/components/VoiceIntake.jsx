import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  User, 
  Globe, 
  ArrowRight, 
  ShieldAlert, 
  RotateCcw,
  FileText,
  Activity,
  ChevronRight,
  Sun,
  Plus,
  PlusCircle,
  Stethoscope
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AudioWaveform from './AudioWaveform';
import { analyzeVoiceTriage, createPatient } from '../services/api';

export default function VoiceIntake({ onPatientAdded }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('35');
  const [patientGender, setPatientGender] = useState('Female');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triageResult, setTriageResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);
  const [customDiseaseInput, setCustomDiseaseInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [addedNotice, setAddedNotice] = useState('');

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  const baseTranscriptRef = useRef('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event) => {
          let liveText = '';
          for (let i = 0; i < event.results.length; i++) {
            liveText += event.results[i][0].transcript;
          }
          const combined = baseTranscriptRef.current 
            ? (baseTranscriptRef.current + ' ' + liveText).trim() 
            : liveText.trim();
          setTranscript(combined);
          setStatusMessage('Listening to your spoken symptoms...');
        };

        recognition.onerror = (event) => {
          if (event.error === 'no-speech') {
            setStatusMessage('No speech detected. Please speak clearly into the microphone.');
          } else if (event.error === 'not-allowed') {
            setStatusMessage('Microphone access blocked. Please allow mic permissions in browser.');
            setIsListening(false);
            shouldListenRef.current = false;
          } else {
            setStatusMessage(`Speech status: ${event.error}. You can also tap disease chips or type below.`);
          }
        };

        recognition.onend = () => {
          if (shouldListenRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              setIsListening(false);
              shouldListenRef.current = false;
            }
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        recognitionRef.current = null;
      }
    } else {
      recognitionRef.current = null;
    }
  }, [language]);

  const startFallbackAudioRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        setStatusMessage('Recording stopped. Type symptoms, tap disease chips, or use Chrome for real-time speech transcription.');
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsListening(true);
      setStatusMessage('HTML5 Audio Recorder active. Speak your disease into the mic...');
    } catch (err) {
      console.warn('Microphone access error:', err);
      setStatusMessage('Microphone permission required. Tap any disease chip or type symptoms below.');
      setIsListening(false);
    }
  };

  const stopFallbackAudioRecorder = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      stopFallbackAudioRecorder();
      setIsListening(false);
      setStatusMessage('Voice recording stopped.');
      return;
    }

    baseTranscriptRef.current = transcript;
    setTriageResult(null);
    shouldListenRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language;
        recognitionRef.current.start();
        setIsListening(true);
        setStatusMessage('Microphone active. Speak your disease or symptoms now...');
      } catch (err) {
        startFallbackAudioRecorder();
      }
    } else {
      startFallbackAudioRecorder();
    }
  };

  const appendDiseaseToBox = (diseaseText) => {
    if (!diseaseText || !diseaseText.trim()) return;
    const cleanText = diseaseText.trim();
    setTranscript((prev) => {
      if (!prev || !prev.trim()) return cleanText;
      return prev.trim() + ', ' + cleanText;
    });
    baseTranscriptRef.current = transcript ? (transcript + ', ' + cleanText) : cleanText;
    setAddedNotice(`Added "${cleanText}" to box!`);
    setTimeout(() => setAddedNotice(''), 2500);
  };

  const handleAddCustomDisease = (e) => {
    e.preventDefault();
    if (!customDiseaseInput.trim()) return;
    appendDiseaseToBox(customDiseaseInput);
    setCustomDiseaseInput('');
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeVoiceTriage(transcript.trim(), language);
      setTriageResult(res);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.7 }
      });
    } catch (err) {
      console.error('Triage analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddToQueue = async () => {
    if (!triageResult) return;
    setIsSubmitting(true);
    try {
      const created = await createPatient({
        name: patientName.trim() || 'Anonymous Patient',
        age: Number(patientAge) || 35,
        gender: patientGender,
        language,
        rawTranscript: transcript.trim(),
        triage: triageResult
      });

      setSubmitSuccess(created);
      if (onPatientAdded) onPatientAdded(created);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTranscript('');
    baseTranscriptRef.current = '';
    setTriageResult(null);
    setSubmitSuccess(null);
    setPatientName('');
    setStatusMessage('');
    setAddedNotice('');
  };

  const loadPreset = (presetText, name = 'Preset Patient') => {
    setTranscript(presetText);
    baseTranscriptRef.current = presetText;
    setPatientName(name);
    setTriageResult(null);
    setSubmitSuccess(null);
    setAddedNotice(`Loaded preset for ${name}`);
    setTimeout(() => setAddedNotice(''), 2500);
  };

  const commonDiseaseChips = [
    { label: '🫀 Severe Chest Pain', text: 'Severe crushing chest pain radiating to arm' },
    { label: '🫁 Shortness of Breath', text: 'Intense shortness of breath and difficulty breathing' },
    { label: '🌡️ High Fever', text: 'High fever of 103°F with intense chills' },
    { label: '🧠 Migraine & Dizziness', text: 'Severe throbbing headache, dizziness, and nausea' },
    { label: '🤢 Acute Abdominal Pain', text: 'Sharp lower right quadrant abdominal pain with vomiting' },
    { label: '🩸 Profuse Bleeding', text: 'Deep laceration bleeding profusely' },
    { label: '🦴 Joint / Limb Trauma', text: 'Severe swelling and sharp pain in limb after injury' },
    { label: '😷 Persistent Cough', text: 'Persistent dry cough and chest tightness' }
  ];

  const presets = [
    {
      title: 'Acute Chest Pain & Dyspnea',
      name: 'Rajesh Sharma',
      esi: 1,
      text: 'Severe crushing chest pain radiating to left shoulder and jaw with cold sweats for 15 minutes',
      badgeClass: 'bg-pink-50 text-pink-900 border-pink-200 hover:bg-pink-100',
      icon: ShieldAlert
    },
    {
      title: 'Arterial Forearm Bleeding',
      name: 'Vikram Patel',
      esi: 2,
      text: 'Deep 10cm arterial laceration on right forearm bleeding profusely from power saw accident',
      badgeClass: 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100',
      icon: AlertTriangle
    },
    {
      title: 'High Fever & Abdominal Pain',
      name: 'Priya Verma',
      esi: 3,
      text: 'Mujhe 102 degree fever hai aur pet me tez dard ho raha hai',
      badgeClass: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
      icon: Activity
    },
    {
      title: 'Mild Ankle Sprain',
      name: 'Aarav Kapoor',
      esi: 4,
      text: 'Minor sprained left ankle while playing basketball, slight swelling, able to bear partial weight',
      badgeClass: 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100',
      icon: CheckCircle2
    }
  ];

  const languages = [
    { code: 'en-US', label: 'English (US)' },
    { code: 'hi-IN', label: 'Hindi (हिंदी)' }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      <div className="sunny-card p-8 sm:p-10 rounded-3xl relative overflow-hidden bg-white/90">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-amber-100">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black mb-2.5 shadow-sm">
              <Sun className="w-4 h-4 text-orange-500" />
              <span>Compassionate ER Voice Triage Engine</span>
            </div>
            <h2 className="text-3xl font-black text-indigo-950 tracking-tight">Patient Voice & Symptom Intake</h2>
            <p className="text-xs text-stone-600 mt-1 font-bold">Speak symptoms into mic, select disease tags, or type directly into the box below for immediate AI triage classification.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-full border border-amber-200 shadow-inner">
              <Globe className="w-4 h-4 text-orange-500 ml-2" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-stone-800 outline-none pr-3 cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code} className="bg-white text-stone-800 font-semibold">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="my-6 pt-2">
          <p className="text-xs font-black text-stone-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span>Select Quick Test Clinical Scenario:</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {presets.map((p, idx) => {
              const Icon = p.icon;
              return (
                <button
                  key={idx}
                  onClick={() => loadPreset(p.text, p.name)}
                  className={`p-4 rounded-2xl border text-left transition-all sunny-card-hover flex flex-col justify-between ${p.badgeClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <Icon className="w-3.5 h-3.5" /> ESI {p.esi}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </div>
                    <h4 className="text-xs font-black text-indigo-950">{p.title}</h4>
                    <p className="text-[11px] opacity-80 mt-1 line-clamp-2 leading-tight font-semibold text-stone-700">{p.text}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-stone-600 uppercase tracking-wider">Patient Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-stone-50 border border-amber-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-stone-600 uppercase tracking-wider">Age (Years)</label>
            <input
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(e.target.value)}
              className="w-full bg-stone-50 border border-amber-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-stone-600 uppercase tracking-wider">Gender</label>
            <select
              value={patientGender}
              onChange={(e) => setPatientGender(e.target.value)}
              className="w-full bg-stone-50 border border-amber-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Non-Binary">Non-Binary</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 my-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-orange-500" />
              <span>Instant Tap-to-Add Common Disease & Symptom Chips:</span>
            </span>
            {addedNotice && (
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 animate-pulse">
                {addedNotice}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {commonDiseaseChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => appendDiseaseToBox(chip.text)}
                className="px-3.5 py-2 rounded-xl bg-white border border-amber-200 hover:border-orange-500 hover:bg-orange-50 text-stone-800 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
              >
                <Plus className="w-3.5 h-3.5 text-orange-500" />
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleAddCustomDisease} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Type any specific disease or symptom (e.g. Dengue Fever, Asthma) and press Enter..."
              value={customDiseaseInput}
              onChange={(e) => setCustomDiseaseInput(e.target.value)}
              className="flex-1 bg-white border border-amber-200 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-900 focus:outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!customDiseaseInput.trim()}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add to Box</span>
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center justify-center my-8">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <span className="absolute w-36 h-36 rounded-full bg-rose-400/30 animate-ping" />
                <span className="absolute w-48 h-48 rounded-full bg-rose-400/20 animate-pulse" />
              </>
            )}
            <button
              onClick={toggleListening}
              className={`relative z-10 flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                isListening
                  ? 'btn-coral-gradient scale-110 shadow-lg shadow-rose-500/30'
                  : 'pulse-buffer-btn hover:scale-105 shadow-xl shadow-orange-500/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-10 h-10 text-white" />
              ) : (
                <Mic className="w-10 h-10 text-white" />
              )}
            </button>
          </div>

          <p className="text-xs font-black mt-4 text-stone-800 tracking-wide text-center">
            {isListening
              ? '🎙️ Recording Voice Input... Click again to stop & append into box!'
              : 'Click Microphone to Start Voice Intake'}
          </p>

          {statusMessage && (
            <p className="text-[11px] font-extrabold text-orange-600 mt-1.5 text-center bg-orange-50 px-3 py-1.5 rounded-full border border-orange-200">
              {statusMessage}
            </p>
          )}
        </div>

        <AudioWaveform isListening={isListening} />

        <div className="space-y-2 mt-6">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-orange-500" />
              <span>Voice Speech Transcript & Clinical Description (The Box)</span>
            </label>
            {transcript && (
              <button
                onClick={() => {
                  setTranscript('');
                  baseTranscriptRef.current = '';
                }}
                className="text-xs text-stone-400 hover:text-stone-700 flex items-center gap-1 font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Box
              </button>
            )}
          </div>

          <textarea
            rows={4}
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value);
              baseTranscriptRef.current = e.target.value;
            }}
            placeholder="Your spoken diseases and symptoms will appear here in real-time as you speak... You can also tap the disease chips above or type directly into this box."
            className="w-full bg-stone-50 border-2 border-amber-300 rounded-2xl p-4 text-xs font-bold text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-sans leading-relaxed shadow-inner"
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!transcript.trim() || isAnalyzing}
            className="pulse-buffer-btn px-9 py-4 font-black text-xs uppercase tracking-wider flex items-center gap-2.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isAnalyzing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Evaluating AI Clinical Triage...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Classify ESI & Detect Red Flags</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>



      <AnimatePresence>
        {triageResult && !submitSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`sunny-card p-6 sm:p-8 rounded-3xl border ${
              triageResult.esiLevel <= 2 ? 'esi-halo-1 bg-pink-50/90 border-pink-300' : 'border-amber-200 bg-white/95'
            }`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-amber-100">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-black shadow-lg ${
                  triageResult.esiLevel === 1 ? 'bg-pink-600 text-white animate-pulse' :
                  triageResult.esiLevel === 2 ? 'bg-orange-500 text-white' :
                  triageResult.esiLevel === 3 ? 'bg-amber-500 text-white' :
                  triageResult.esiLevel === 4 ? 'bg-teal-600 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  <span className="text-[9px] uppercase font-mono tracking-wider">ESI LEVEL</span>
                  <span className="text-3xl font-black">{triageResult.esiLevel}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-indigo-950">{triageResult.chiefComplaint}</h3>
                  <p className="text-xs text-stone-600 mt-0.5 font-bold">Classified Priority: Emergency Severity Index Tier {triageResult.esiLevel}</p>
                </div>
              </div>

              {triageResult.esiLevel <= 2 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 border border-pink-300 text-pink-900 font-black text-xs animate-bounce">
                  <ShieldAlert className="w-5 h-5 text-pink-600" />
                  <span>HIGH PRIORITY EMERGENCY: ATOMIC QUEUE JUMP</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-stone-600 uppercase tracking-wider block mb-1.5">Translated Clinical Summary</label>
                  <p className="text-xs text-stone-900 bg-stone-50 p-4 rounded-2xl border border-amber-200 leading-relaxed font-bold">
                    {triageResult.translatedSummary}
                  </p>
                </div>

                <div>
                  <label className="text-[11px] font-black text-stone-600 uppercase tracking-wider block mb-1.5">Triage Rationale</label>
                  <p className="text-xs text-stone-700 bg-stone-50 p-4 rounded-2xl border border-amber-200 leading-relaxed font-semibold">
                    {triageResult.triageRationale}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-black text-stone-600 uppercase tracking-wider block mb-1.5">Red Flags Identified</label>
                  <div className="flex flex-wrap gap-2">
                    {triageResult.redFlags && triageResult.redFlags.length > 0 ? (
                      triageResult.redFlags.map((flag, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 rounded-full bg-pink-100 border border-pink-300 text-pink-900 text-xs font-black flex items-center gap-1.5 shadow-sm">
                          <AlertTriangle className="w-3.5 h-3.5 text-pink-600" />
                          {flag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-stone-500 italic font-semibold">No life-threatening flags detected</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-black text-stone-600 uppercase tracking-wider block mb-1.5">Recommended Care Action</label>
                  <p className="text-xs text-teal-950 bg-teal-50 p-4 rounded-2xl border border-teal-200 leading-relaxed font-bold">
                    {triageResult.recommendedAction}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-stone-700 pt-2 font-bold">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span>Estimated Doctor Handling Time: <strong className="text-stone-900 font-mono">{triageResult.estimatedTimeMinutes} mins</strong></span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-100">
              <button
                onClick={resetForm}
                className="px-5 py-2.5 rounded-full bg-amber-100 text-xs font-bold text-amber-900 hover:bg-amber-200 transition-colors"
              >
                Reset Intake
              </button>

              <button
                onClick={handleAddToQueue}
                disabled={isSubmitting}
                className="pulse-buffer-btn px-7 py-2.5 font-black text-xs flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Saving Record...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Atomically Re-order Queue</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {submitSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="sunny-card p-8 rounded-3xl border border-emerald-300 text-center space-y-4 shadow-xl bg-emerald-50/95"
          >
            <div className="w-16 h-16 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-indigo-950">Patient Added & Queue Atomically Re-ordered!</h3>
            <p className="text-sm text-stone-700 font-bold max-w-md mx-auto">
              Patient <strong className="text-orange-600">{submitSuccess.name}</strong> assigned ticket{' '}
              <span className="font-mono text-indigo-950 font-black px-2.5 py-1 rounded-full bg-white border border-amber-300 shadow-sm">
                {submitSuccess.ticketId}
              </span>{' '}
              at ESI Rank #{submitSuccess.rank}.
            </p>
            <div className="pt-4">
              <button
                onClick={resetForm}
                className="pulse-buffer-btn px-8 py-3.5 font-black text-xs uppercase tracking-wider"
              >
                Perform Another Voice Intake
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
