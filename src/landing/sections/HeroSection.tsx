import React from 'react';

const HeroSection: React.FC = () => {
  const handleStartDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartGame = () => {
    window.location.href = '/?game=NEW';
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Logo/Title */}
        <div className="mb-16 animate-fade-in">
          <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-12">
            Prozessorix
          </h1>
          <div className="space-y-4 text-3xl md:text-5xl font-bold text-gray-800">
            <div className="animate-fade-in animation-delay-200">Prozesse spielerisch</div>
            <div className="animate-fade-in animation-delay-400">Designen</div>
            <div className="animate-fade-in animation-delay-600">Optimieren</div>
            <div className="animate-fade-in animation-delay-800">Digitalisieren</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-1500">
          <button
            onClick={handleStartGame}
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-indigo-500/50 transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">🎮 Jetzt starten</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <button
            onClick={handleStartDemo}
            className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-2 border-indigo-200"
          >
            📺 Demo ansehen
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="mt-20 animate-bounce">
          <svg className="w-6 h-6 mx-auto text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
