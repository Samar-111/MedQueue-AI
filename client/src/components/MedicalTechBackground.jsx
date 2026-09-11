import React from 'react';

export default function MedicalTechBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#050b18]">
      
      <div 
        className="absolute inset-0 opacity-80"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, rgba(14, 165, 233, 0.15) 0%, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(20, 184, 166, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.9) 0%, #050b18 100%)
          `
        }}
      />

      <div 
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(56, 189, 248, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />

      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>

          <pattern id="dotGrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#38bdf8" fillOpacity="0.15" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#dotGrid)" />

        <g className="animate-pulse" style={{ animationDuration: '6s' }}>
          <path
            d="M -100 180 L 200 180 L 220 180 L 230 130 L 240 230 L 250 100 L 265 260 L 280 160 L 290 180 L 1400 180"
            fill="none"
            stroke="url(#ecgGrad)"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
          <path
            d="M -100 850 L 500 850 L 515 800 L 525 900 L 535 770 L 550 930 L 565 830 L 575 850 L 1600 850"
            fill="none"
            stroke="url(#ecgGrad)"
            strokeWidth="2.5"
          />
        </g>

        <g opacity="0.25">
          <circle cx="15%" cy="25%" r="180" stroke="#38bdf8" strokeWidth="1" fill="none" strokeDasharray="12 8" className="animate-spin-slow" />
          <circle cx="85%" cy="75%" r="240" stroke="#14b8a6" strokeWidth="1.5" fill="none" strokeDasharray="16 12" className="animate-spin-reverse-slow" />
        </g>

        <g opacity="0.2" transform="translate(120, 100)">
          <path
            d="M 60 20 L 100 20 L 100 60 L 140 60 L 140 100 L 100 100 L 100 140 L 60 140 L 60 100 L 20 100 L 20 60 L 60 60 Z"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
          />
          <circle cx="80" cy="80" r="70" stroke="#06b6d4" strokeWidth="1" fill="none" strokeDasharray="6 4" />
        </g>

        <g opacity="0.18" transform="translate(1300, 450)">
          <path
            d="M 60 20 L 100 20 L 100 60 L 140 60 L 140 100 L 100 100 L 100 140 L 60 140 L 60 100 L 20 100 L 20 60 L 60 60 Z"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2"
          />
        </g>

        <g opacity="0.35">
          <line x1="200" y1="300" x2="350" y2="220" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="350" y1="220" x2="500" y2="350" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="350" y1="220" x2="320" y2="450" stroke="#14b8a6" strokeWidth="1" />

          <line x1="1100" y1="650" x2="1250" y2="580" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="1250" y1="580" x2="1400" y2="700" stroke="#14b8a6" strokeWidth="1" strokeDasharray="4 4" />

          <circle cx="200" cy="300" r="4" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '4s' }} />
          <circle cx="350" cy="220" r="5" fill="#06b6d4" />
          <circle cx="500" cy="350" r="4" fill="#14b8a6" />
          <circle cx="320" cy="450" r="3" fill="#38bdf8" />

          <circle cx="1100" cy="650" r="4" fill="#14b8a6" />
          <circle cx="1250" cy="580" r="5" fill="#38bdf8" className="animate-ping" style={{ animationDuration: '5s' }} />
          <circle cx="1400" cy="700" r="4" fill="#06b6d4" />
        </g>
      </svg>

      <div className="absolute top-1/4 left-1/12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-1/4 right-1/12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
    </div>
  );
}
