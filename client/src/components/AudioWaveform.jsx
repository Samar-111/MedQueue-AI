import React from 'react';
import { motion } from 'framer-motion';

export default function AudioWaveform({ isListening }) {
  const bars = [40, 75, 100, 60, 90, 45, 80, 100, 65, 85, 50, 95, 70, 40, 85];

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 my-4 px-4 bg-slate-900/60 rounded-2xl border border-cyan-500/20 shadow-inner">
      {bars.map((heightPercent, idx) => (
        <motion.div
          key={idx}
          className={`w-1.5 rounded-full ${
            isListening
              ? 'bg-gradient-to-t from-cyan-500 via-teal-400 to-rose-500'
              : 'bg-slate-700/50'
          }`}
          animate={
            isListening
              ? {
                  scaleY: [0.2, (heightPercent / 100) * 1.4, 0.3],
                  opacity: [0.6, 1, 0.6]
                }
              : { scaleY: 0.2, opacity: 0.3 }
          }
          transition={
            isListening
              ? {
                  duration: 0.6 + (idx % 4) * 0.15,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                  delay: idx * 0.04
                }
              : { duration: 0.3 }
          }
          style={{ height: '100%', transformOrigin: 'center' }}
        />
      ))}
    </div>
  );
}
