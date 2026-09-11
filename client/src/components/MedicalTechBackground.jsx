import React, { useEffect, useRef } from 'react';

export default function MedicalTechBackground({ themeMode = 'light' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const isDark = themeMode === 'dark';

    const particles = Array.from({ length: 16 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -0.1 - Math.random() * 0.15,
      radius: Math.random() * 2.5 + 1,
      color: isDark 
        ? ['#38bdf8', '#2dd4bf', '#818cf8', '#38bdf8'][Math.floor(Math.random() * 4)]
        : ['#0284c7', '#0d9488', '#6366f1', '#64748b'][Math.floor(Math.random() * 4)],
      alpha: isDark ? Math.random() * 0.35 + 0.2 : Math.random() * 0.25 + 0.1
    }));

    const staticNodes = [
      { x: width * 0.08, y: height * 0.2 },
      { x: width * 0.18, y: height * 0.35 },
      { x: width * 0.82, y: height * 0.65 },
      { x: width * 0.92, y: height * 0.8 }
    ];

    let pulseTime = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      pulseTime += 0.008;
      const lineAlpha = isDark ? Math.sin(pulseTime) * 0.08 + 0.15 : Math.sin(pulseTime) * 0.04 + 0.08;

      ctx.beginPath();
      ctx.moveTo(staticNodes[0].x, staticNodes[0].y);
      ctx.lineTo(staticNodes[1].x, staticNodes[1].y);
      ctx.moveTo(staticNodes[2].x, staticNodes[2].y);
      ctx.lineTo(staticNodes[3].x, staticNodes[3].y);
      ctx.strokeStyle = isDark ? '#38bdf8' : '#94a3b8';
      ctx.globalAlpha = lineAlpha;
      ctx.lineWidth = 1;
      ctx.stroke();

      staticNodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
        ctx.globalAlpha = lineAlpha * 1.5;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [themeMode]);

  const isDark = themeMode === 'dark';

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none transition-colors duration-500 ${isDark ? 'bg-[#0b1120]' : 'bg-[#f1f4f8]'}`}>
      
      <div 
        className="absolute inset-0 opacity-90 transition-all duration-500"
        style={{
          background: isDark
            ? `
              radial-gradient(circle at 12% 18%, rgba(14, 165, 233, 0.16) 0%, transparent 45%),
              radial-gradient(circle at 88% 82%, rgba(20, 184, 166, 0.14) 0%, transparent 50%),
              radial-gradient(circle at 50% 90%, rgba(99, 102, 241, 0.12) 0%, transparent 55%),
              #0b1120
            `
            : `
              radial-gradient(circle at 12% 18%, rgba(2, 132, 199, 0.06) 0%, transparent 45%),
              radial-gradient(circle at 88% 82%, rgba(13, 148, 136, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 50% 90%, rgba(99, 102, 241, 0.04) 0%, transparent 55%),
              #f1f4f8
            `
        }}
      />

      <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-80' : 'opacity-60'}`} />

      <svg className={`absolute inset-0 w-full h-full ${isDark ? 'opacity-55' : 'opacity-35'}`}>
        <defs>
          <linearGradient id="medEcgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={isDark ? '#38bdf8' : '#0284c7'} stopOpacity="0" />
            <stop offset="30%" stopColor={isDark ? '#38bdf8' : '#0284c7'} stopOpacity={isDark ? '0.6' : '0.25'} />
            <stop offset="70%" stopColor={isDark ? '#2dd4bf' : '#0d9488'} stopOpacity={isDark ? '0.6' : '0.25'} />
            <stop offset="100%" stopColor={isDark ? '#818cf8' : '#6366f1'} stopOpacity="0" />
          </linearGradient>

          <pattern id="medSubtleGrid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke={isDark ? 'rgba(51, 65, 85, 0.35)' : 'rgba(148, 163, 184, 0.12)'} strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#medSubtleGrid)" />

        <g>
          <path
            d="M -100 220 L 220 220 L 235 220 L 245 180 L 255 260 L 265 140 L 278 300 L 290 200 L 300 220 L 1600 220"
            fill="none"
            stroke="url(#medEcgGrad)"
            strokeWidth={isDark ? '2' : '1.5'}
            strokeDasharray="16 8"
            className="animate-ecg-calm"
          />
        </g>

        <g opacity={isDark ? '0.35' : '0.18'}>
          <circle cx="10%" cy="25%" r="140" stroke={isDark ? '#38bdf8' : '#0284c7'} strokeWidth="1" fill="none" strokeDasharray="10 8" className="animate-spin-ultra-slow" />
          <circle cx="90%" cy="75%" r="180" stroke={isDark ? '#2dd4bf' : '#0d9488'} strokeWidth="1" fill="none" strokeDasharray="12 10" className="animate-spin-ultra-reverse" />
        </g>

        <g opacity={isDark ? '0.2' : '0.1'} transform="translate(60, 60)">
          <path
            d="M 40 10 L 70 10 L 70 40 L 100 40 L 100 70 L 70 70 L 70 100 L 40 100 L 40 70 L 10 70 L 10 40 L 40 40 Z"
            fill={isDark ? 'rgba(56, 189, 248, 0.2)' : 'rgba(2, 132, 199, 0.15)'}
            stroke={isDark ? '#38bdf8' : '#0284c7'}
            strokeWidth="1.5"
          />
        </g>

        <g opacity={isDark ? '0.18' : '0.08'} transform="translate(1400, 480)">
          <path
            d="M 40 10 L 70 10 L 70 40 L 100 40 L 100 70 L 70 70 L 70 100 L 40 100 L 40 70 L 10 70 L 10 40 L 40 40 Z"
            fill={isDark ? 'rgba(45, 212, 191, 0.2)' : 'rgba(13, 148, 136, 0.15)'}
            stroke={isDark ? '#2dd4bf' : '#0d9488'}
            strokeWidth="1.5"
          />
        </g>
      </svg>
    </div>
  );
}
