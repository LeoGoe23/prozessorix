import React from 'react';

const CTASection: React.FC = () => {
  const handleStartNow = () => {
    window.location.href = '/?game=NEW';
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Main CTA */}
        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
          Bereit durchzustarten?
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          Keine Registrierung, keine Installation – einfach loslegen und Prozesse zum Leben erwecken!
        </p>

        {/* CTA Button */}
        <button
          onClick={handleStartNow}
          className="group inline-flex items-center gap-3 px-12 py-6 bg-white text-purple-600 rounded-full font-black text-2xl shadow-2xl hover:shadow-white/30 transition-all hover:scale-110 active:scale-95 mb-12"
        >
          <span>🚀</span>
          <span>Jetzt kostenlos starten</span>
          <span className="transform group-hover:translate-x-2 transition-transform">→</span>
        </button>

        {/* Features List */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">Keine Anmeldung</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">Kostenlos</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">Echtzeit-Kollaboration</span>
          </div>
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-2xl">✓</span>
            <span className="font-semibold">Intuitiv</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/20 pt-8">
          <p className="text-white/70 text-sm">
            Made with ❤️ for better processes
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
