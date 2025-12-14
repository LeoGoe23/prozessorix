import React from 'react';

const HeroSection: React.FC = () => {
  const startNewGame = () => {
    window.location.href = '/?game=NEW';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-[10%] pt-32 pb-20 overflow-hidden">
      {/* Animated Process Flow Background */}
      <div className="absolute inset-0 overflow-visible pointer-events-none py-16">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {/* Hauptprozesslinie mit Dash-Animation für Fluss-Effekt */}
          <path
            d="M 100 120 L 900 120 L 900 880 L 100 880 Z"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="30 15"
            strokeDashoffset="0"
            className="animate-dash-flow"
            opacity="0.4"
          />
          
          {/* Glowing outer line */}
          <path
            d="M 100 120 L 900 120 L 900 880 L 100 880 Z"
            fill="none"
            stroke="url(#gradient-glow)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.15"
            filter="url(#glow)"
          />
          
          {/* Kleiner animierter Pfeil der sich entlang der Linie bewegt */}
          <g className="animate-arrow-path" opacity="0.95">
            <polygon points="-8,-6 2,0 -8,6 -6,0" fill="url(#gradient)" filter="url(#glow)" />
          </g>
          
          <defs>
            {/* Main gradient with animation */}
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#6366f1; #8b5cf6; #ec4899; #f59e0b; #10b981; #3b82f6; #6366f1" dur="10s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#8b5cf6; #ec4899; #f59e0b; #10b981; #3b82f6; #6366f1; #8b5cf6" dur="10s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }}>
                <animate attributeName="stop-color" values="#ec4899; #f59e0b; #10b981; #3b82f6; #6366f1; #8b5cf6; #ec4899" dur="10s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            
            {/* Glow gradient */}
            <linearGradient id="gradient-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#6366f1', stopOpacity: 0.8 }}>
                <animate attributeName="stop-color" values="#6366f1; #8b5cf6; #ec4899; #f59e0b; #10b981; #3b82f6; #6366f1" dur="10s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.8 }}>
                <animate attributeName="stop-color" values="#ec4899; #f59e0b; #10b981; #3b82f6; #6366f1; #8b5cf6; #ec4899" dur="10s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            
            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>

      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-15 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-15 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-96 h-96 bg-pink-500 rounded-full filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        {/* Minimalistischer Content */}
        <div className="space-y-8 animate-fade-in">
          {/* Subtitle */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 shadow-lg">
            <span className="text-sm text-indigo-300 font-medium">Prozessvisualisierung neu gedacht</span>
          </div>

          {/* Main Headline - Minimalistisch */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white leading-tight tracking-tight">
            Verwandle komplexe Prozesse in
            <span className="block mt-3 font-semibold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              interaktive Lernerlebnisse
            </span>
          </h1>

          {/* Description - Kurz und prägnant */}
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
            Kollaboratives Tool für Teams, um Geschäftsprozesse gemeinsam zu visualisieren und zu verstehen
          </p>

          {/* CTA Button - Minimalistisch */}
          <div className="pt-6">
            <button
              onClick={startNewGame}
              className="group px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-400/60 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Jetzt starten
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <svg className="w-6 h-6 mx-auto text-gray-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        @keyframes arrow-path {
          0% { offset-distance: 0%; }
          100% { offset-distance: 100%; }
        }
        .animate-arrow-path {
          offset-path: path('M 100 120 L 900 120 L 900 880 L 100 880 Z');
          animation: arrow-path 12s linear infinite;
        }
        @keyframes dash-flow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -45; }
        }
        .animate-dash-flow {
          animation: dash-flow 2s linear infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 1s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        .animation-delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
          opacity: 0;
          animation-fill-mode: forwards;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
