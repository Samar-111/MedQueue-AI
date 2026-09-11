import React, { useEffect, useRef } from 'react';

export default function MedicalTechBackground() {
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

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -0.3 - Math.random() * 0.5,
      radius: Math.random() * 2.5 + 1,
      color: ['#06b6d4', '#38bdf8', '#14b8a6', '#818cf8', '#22d3ee'][Math.floor(Math.random() * 5)],
      alpha: Math.random() * 0.7 + 0.3
    }));

    const nodes = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 3 + 3,
      pulse: Math.random() * Math.PI * 2,
      color: ['#38bdf8', '#06b6d4', '#22d3ee', '#818cf8'][Math.floor(Math.random() * 4)]
    }));

    const packets = Array.from({ length: 8 }, () => {
      const from = Math.floor(Math.random() * nodes.length);
      let to = Math.floor(Math.random() * nodes.length);
      while (to === from) to = Math.floor(Math.random() * nodes.length);
      return { from, to, progress: Math.random(), speed: Math.random() * 0.008 + 0.004 };
    });

    const flowPoints = [
      { x: width * 0.08, y: height * 0.18, label: 'REGISTRATION' },
      { x: width * 0.28, y: height * 0.12, label: 'AI TRIAGE' },
      { x: width * 0.72, y: height * 0.12, label: 'PRIORITY QUEUE' },
      { x: width * 0.92, y: height * 0.18, label: 'DOCTOR EVALUATION' }
    ];

    const flowDots = Array.from({ length: 6 }, (_, i) => ({
      progress: (i / 6),
      speed: 0.002
    }));

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
        ctx.globalAlpha = p.alpha * 0.8;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.03;

        if (n.x < 50 || n.x > width - 50) n.vx *= -1;
        if (n.y < 50 || n.y > height - 50) n.vy *= -1;

        const currentR = n.radius + Math.sin(n.pulse) * 1.5;

        ctx.beginPath();
        ctx.arc(n.x, n.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.globalAlpha = 0.7;
        ctx.shadowBlur = 12;
        ctx.shadowColor = n.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 220) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = '#38bdf8';
            ctx.globalAlpha = (1 - dist / 220) * 0.25;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      packets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1) {
          pkt.progress = 0;
          pkt.from = Math.floor(Math.random() * nodes.length);
          let nextTo = Math.floor(Math.random() * nodes.length);
          while (nextTo === pkt.from) nextTo = Math.floor(Math.random() * nodes.length);
          pkt.to = nextTo;
        }

        const start = nodes[pkt.from];
        const end = nodes[pkt.to];
        if (start && end) {
          const px = start.x + (end.x - start.x) * pkt.progress;
          const py = start.y + (end.y - start.y) * pkt.progress;

          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#22d3ee';
          ctx.globalAlpha = 0.9;
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#22d3ee';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      ctx.beginPath();
      ctx.moveTo(flowPoints[0].x, flowPoints[0].y);
      ctx.bezierCurveTo(
        flowPoints[1].x, flowPoints[1].y - 40,
        flowPoints[2].x, flowPoints[2].y - 40,
        flowPoints[3].x, flowPoints[3].y
      );
      ctx.strokeStyle = '#14b8a6';
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      flowDots.forEach((dot) => {
        dot.progress += dot.speed;
        if (dot.progress > 1) dot.progress = 0;

        const t = dot.progress;
        const p0 = flowPoints[0];
        const p1 = { x: flowPoints[1].x, y: flowPoints[1].y - 40 };
        const p2 = { x: flowPoints[2].x, y: flowPoints[2].y - 40 };
        const p3 = flowPoints[3];

        const cx = Math.pow(1 - t, 3) * p0.x + 3 * Math.pow(1 - t, 2) * t * p1.x + 3 * (1 - t) * Math.pow(t, 2) * p2.x + Math.pow(t, 3) * p3.x;
        const cy = Math.pow(1 - t, 3) * p0.y + 3 * Math.pow(1 - t, 2) * t * p1.y + 3 * (1 - t) * Math.pow(t, 2) * p2.y + Math.pow(t, 3) * p3.y;

        ctx.beginPath();
        ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.globalAlpha = 0.95;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none bg-[#030712]">
      
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: `
            radial-gradient(circle at 10% 15%, rgba(14, 165, 233, 0.22) 0%, transparent 45%),
            radial-gradient(circle at 90% 85%, rgba(20, 184, 166, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
            radial-gradient(circle at 50% 100%, rgba(3, 7, 18, 0.95) 0%, #030712 100%)
          `
        }}
      />

      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <svg className="absolute inset-0 w-full h-full opacity-60">
        <defs>
          <linearGradient id="brightEcgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="25%" stopColor="#38bdf8" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="75%" stopColor="#14b8a6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </linearGradient>

          <pattern id="medicalGridPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="1" />
            <circle cx="20" cy="20" r="1" fill="#38bdf8" fillOpacity="0.25" />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill="url(#medicalGridPattern)" />

        <g className="animate-pulse" style={{ animationDuration: '4s' }}>
          <path
            d="M -100 240 L 150 240 L 170 240 L 180 170 L 190 290 L 205 110 L 220 330 L 235 210 L 245 240 L 1600 240"
            fill="none"
            stroke="url(#brightEcgGrad)"
            strokeWidth="3"
            strokeDasharray="12 6"
            className="animate-ecg-sweep"
          />
          <path
            d="M -100 800 L 400 800 L 415 740 L 425 860 L 435 690 L 450 910 L 465 770 L 475 800 L 1600 800"
            fill="none"
            stroke="url(#brightEcgGrad)"
            strokeWidth="2.5"
          />
        </g>

        <g opacity="0.4">
          <circle cx="12%" cy="28%" r="160" stroke="#38bdf8" strokeWidth="1.5" fill="none" strokeDasharray="14 10" className="animate-spin-slow" />
          <circle cx="12%" cy="28%" r="120" stroke="#06b6d4" strokeWidth="1" fill="none" strokeDasharray="6 6" className="animate-spin-reverse-slow" />
          
          <circle cx="88%" cy="72%" r="220" stroke="#14b8a6" strokeWidth="2" fill="none" strokeDasharray="18 12" className="animate-spin-reverse-slow" />
          <circle cx="88%" cy="72%" r="160" stroke="#38bdf8" strokeWidth="1" fill="none" strokeDasharray="8 8" className="animate-spin-slow" />
        </g>

        <g opacity="0.35" transform="translate(80, 80)">
          <path
            d="M 50 15 L 85 15 L 85 50 L 120 50 L 120 85 L 85 85 L 85 120 L 50 120 L 50 85 L 15 85 L 15 50 L 50 50 Z"
            fill="rgba(56, 189, 248, 0.15)"
            stroke="#38bdf8"
            strokeWidth="2"
          />
          <circle cx="67.5" cy="67.5" r="75" stroke="#22d3ee" strokeWidth="1.5" fill="none" strokeDasharray="8 6" className="animate-spin-slow" />
        </g>

        <g opacity="0.3" transform="translate(1350, 380)">
          <path
            d="M 50 15 L 85 15 L 85 50 L 120 50 L 120 85 L 85 85 L 85 120 L 50 120 L 50 85 L 15 85 L 15 50 L 50 50 Z"
            fill="rgba(20, 184, 166, 0.15)"
            stroke="#14b8a6"
            strokeWidth="2"
          />
        </g>
      </svg>

      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(3, 7, 18, 0.3) 0%, rgba(3, 7, 18, 0.75) 100%)'
        }}
      />
    </div>
  );
}
