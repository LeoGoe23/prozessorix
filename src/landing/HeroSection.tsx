import React, { useEffect, useRef } from 'react';

const HeroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const particleCount = 80;
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    function drawParticles() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / 150) * 0.3;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        });
      });

      requestAnimationFrame(drawParticles);
    }

    drawParticles();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startNewGame = () => {
    window.location.href = '/?game=NEW';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-[10%] pt-32 pb-20 overflow-hidden">
      {/* Animated Canvas Background */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />
      
      {/* Animated Grid Background */}
      <div className="absolute inset-0 overflow-visible pointer-events-none opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* Futuristic Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large rotating orbs with gradients */}
        <div className="absolute top-20 left-10 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-transparent rounded-full filter blur-3xl animate-rotate-slow"></div>
        <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-gradient-to-bl from-pink-500/30 via-purple-500/20 to-transparent rounded-full filter blur-3xl animate-rotate-reverse"></div>
        <div className="absolute bottom-20 left-1/3 w-[550px] h-[550px] bg-gradient-to-tr from-cyan-500/25 via-blue-500/15 to-transparent rounded-full filter blur-3xl animate-pulse-glow"></div>
        
        {/* Smaller floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-gradient-to-r from-yellow-500/40 to-orange-500/40 rounded-full filter blur-2xl animate-float"></div>
        <div className="absolute bottom-1/3 left-1/4 w-40 h-40 bg-gradient-to-r from-green-500/40 to-emerald-500/40 rounded-full filter blur-2xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-rose-500/40 to-pink-500/40 rounded-full filter blur-xl animate-float"></div>
      </div>

      {/* Geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-40 left-20 w-64 h-64 border border-indigo-400/30 rotate-45 animate-rotate-slow"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 border-2 border-purple-400/30 rounded-full animate-pulse-glow"></div>
        <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-pink-400/30 -rotate-12 animate-float"></div>
      </div>

      <div className="relative z-10 w-full flex items-center">
        {/* Left Content - Text - mehr nach links */}
        <div className="w-full lg:w-5/12 text-left space-y-8 animate-fade-in pl-8 lg:pl-16">
          {/* Floating Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-full border border-white/30 shadow-lg">
            <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white font-semibold tracking-wide">🚀 Die Zukunft der Prozessvisualisierung</span>
          </div>

          {/* Main Headline with neon effect */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
            <span className="block mb-3 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              DIGITALISIERE.
            </span>
            <span className="block mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
              OPTIMIERE.
            </span>
            <span className="block bg-gradient-to-r from-pink-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
              WACHSE.
            </span>
          </h1>

          {/* Description with glow */}
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light max-w-xl">
            Die führende Plattform für <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 font-semibold">end-to-end Prozessdigitalisierung</span> und <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 font-semibold">Automatisierung</span>
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4">
            <button
              onClick={startNewGame}
              className="group relative px-10 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg font-bold rounded-full shadow-2xl shadow-purple-500/50 hover:shadow-purple-400/70 transition-all duration-300 transform hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
              <span className="relative flex items-center gap-3">
                ⚡ Jetzt starten
                <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
            
            <button className="group px-10 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-lg text-white text-lg font-semibold rounded-full border-2 border-white/30 hover:border-white/50 transition-all duration-300">
              <span className="flex items-center gap-3">
                📺 Demo anfordern
              </span>
            </button>
          </div>
        </div>

        {/* Right - Process Visualization - Direkt ohne Container */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block w-7/12 h-[600px] pr-12">
            <svg className="w-full h-full" viewBox="0 0 800 600" fill="none">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="shadow">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.4"/>
                </filter>
                <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGrad3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="lineGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Connection Lines - Curved with gradients */}
              <path d="M 150 250 Q 350 200 450 300" stroke="url(#lineGrad1)" strokeWidth="3.5" fill="none" opacity="0.6" strokeLinecap="round" />
              <path d="M 450 100 Q 450 200 450 300" stroke="url(#lineGrad2)" strokeWidth="3.5" fill="none" opacity="0.6" strokeLinecap="round" />
              <path d="M 450 300 Q 550 300 650 250" stroke="url(#lineGrad3)" strokeWidth="3.5" fill="none" opacity="0.6" strokeLinecap="round" />
              <path d="M 450 300 Q 500 450 450 500" stroke="url(#lineGrad4)" strokeWidth="3.5" fill="none" opacity="0.6" strokeLinecap="round" />
              
              {/* Dashed segments */}
              <path d="M 240 220 L 310 220" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="8 8" fill="none" opacity="0.4" strokeLinecap="round" />
              <path d="M 540 440 L 580 440" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="8 8" fill="none" opacity="0.4" strokeLinecap="round" />

              {/* Person 1 - Tester (Red) */}
              <g filter="url(#shadow)">
                <circle cx="150" cy="250" r="58" fill="rgba(239, 68, 68, 0.2)" />
                <circle cx="150" cy="250" r="52" fill="#ef4444" />
                <circle cx="150" cy="250" r="48" fill="#dc2626" />
                <circle cx="150" cy="235" r="13" fill="#fca5a5" />
                <path d="M 130 265 Q 150 255 170 265 L 170 282 L 130 282 Z" fill="#fca5a5" />
                <circle cx="125" cy="250" r="7" fill="#3b82f6" stroke="#1e40af" strokeWidth="2.5" />
                <circle cx="175" cy="250" r="7" fill="#3b82f6" stroke="#1e40af" strokeWidth="2.5" />
                <rect x="112" y="298" width="76" height="26" rx="13" fill="rgba(239, 68, 68, 0.95)" />
                <text x="150" y="315" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">Tester</text>
                <text x="150" y="198" textAnchor="middle" fill="#fca5a5" fontSize="14" fontWeight="600">Tom Fischer</text>
              </g>

              {/* Person 2 - Projektmanager (Blue) */}
              <g filter="url(#shadow)">
                <circle cx="450" cy="100" r="58" fill="rgba(59, 130, 246, 0.2)" />
                <circle cx="450" cy="100" r="52" fill="#3b82f6" />
                <circle cx="450" cy="100" r="48" fill="#2563eb" />
                <circle cx="450" cy="85" r="13" fill="#93c5fd" />
                <path d="M 430 115 Q 450 105 470 115 L 470 132 L 430 132 Z" fill="#93c5fd" />
                <circle cx="425" cy="100" r="7" fill="#ec4899" stroke="#be185d" strokeWidth="2.5" />
                <circle cx="475" cy="100" r="7" fill="#ec4899" stroke="#be185d" strokeWidth="2.5" />
                <rect x="380" y="148" width="140" height="26" rx="13" fill="rgba(59, 130, 246, 0.95)" />
                <text x="450" y="165" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">Projektmanager</text>
                <text x="450" y="48" textAnchor="middle" fill="#93c5fd" fontSize="14" fontWeight="600">Anna Schmidt</text>
              </g>

              {/* Decision Diamond - Center */}
              <g filter="url(#shadow)">
                <path d="M 450 255 L 515 300 L 450 345 L 385 300 Z" fill="rgba(245, 158, 11, 0.3)" />
                <path d="M 450 260 L 510 300 L 450 340 L 390 300 Z" fill="#f59e0b" />
                <path d="M 450 265 L 505 300 L 450 335 L 395 300 Z" fill="#f97316" />
                <text x="450" y="312" textAnchor="middle" fill="white" fontSize="30">⚡</text>
              </g>

              {/* Person 3 - Entwickler (Green) */}
              <g filter="url(#shadow)">
                <circle cx="650" cy="250" r="58" fill="rgba(34, 197, 94, 0.2)" />
                <circle cx="650" cy="250" r="52" fill="#22c55e" />
                <circle cx="650" cy="250" r="48" fill="#16a34a" />
                <circle cx="650" cy="235" r="13" fill="#86efac" />
                <path d="M 630 265 Q 650 255 670 265 L 670 282 L 630 282 Z" fill="#86efac" />
                <circle cx="625" cy="250" r="7" fill="#a855f7" stroke="#7e22ce" strokeWidth="2.5" />
                <circle cx="675" cy="250" r="7" fill="#a855f7" stroke="#7e22ce" strokeWidth="2.5" />
                <rect x="595" y="298" width="110" height="26" rx="13" fill="rgba(34, 197, 94, 0.95)" />
                <text x="650" y="315" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">Entwickler</text>
                <text x="650" y="198" textAnchor="middle" fill="#86efac" fontSize="14" fontWeight="600">Max Müller</text>
              </g>

              {/* Person 4 - Designer (Orange) */}
              <g filter="url(#shadow)">
                <circle cx="450" cy="500" r="58" fill="rgba(245, 158, 11, 0.2)" />
                <circle cx="450" cy="500" r="52" fill="#f59e0b" />
                <circle cx="450" cy="500" r="48" fill="#d97706" />
                <circle cx="450" cy="485" r="13" fill="#fde68a" />
                <path d="M 430 515 Q 450 505 470 515 L 470 532 L 430 532 Z" fill="#fde68a" />
                <circle cx="425" cy="500" r="7" fill="#ec4899" stroke="#be185d" strokeWidth="2.5" />
                <circle cx="475" cy="500" r="7" fill="#ec4899" stroke="#be185d" strokeWidth="2.5" />
                <rect x="400" y="548" width="100" height="26" rx="13" fill="rgba(245, 158, 11, 0.95)" />
                <text x="450" y="565" textAnchor="middle" fill="white" fontSize="13" fontWeight="700">Designer</text>
                <text x="450" y="595" textAnchor="middle" fill="#fde68a" fontSize="14" fontWeight="600">Lisa Weber</text>
              </g>
            </svg>
        </div>
      </div>

      {/* Smooth gradient fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950 pointer-events-none"></div>

      {/* Scroll indicator with pulse */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
