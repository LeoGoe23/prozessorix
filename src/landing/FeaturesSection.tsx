import React from 'react';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: '👥',
    title: 'Kollaborativ & Echtzeit',
    description: 'Arbeitet gemeinsam im Team. Alle sehen live, wie der Prozess entsteht und können gleichzeitig beitragen.',
    color: 'from-blue-400 to-blue-600'
  },
  {
    icon: '🎨',
    title: 'Visuell & Intuitiv',
    description: 'Drag & Drop Interface mit bunten Karten, Icons und Verbindungen. Prozesse werden lebendig und verständlich.',
    color: 'from-purple-400 to-purple-600'
  },
  {
    icon: '🎯',
    title: 'Spielerisches Lernen',
    description: 'Verwandle trockene Prozessdokumentation in ein interaktives Erlebnis. Lernen macht Spaß!',
    color: 'from-pink-400 to-pink-600'
  },
  {
    icon: '⚡',
    title: 'Schnell & Flexibel',
    description: 'Keine Installation nötig. Einfach Link teilen und loslegen. Prozesse in Minuten statt Stunden erstellen.',
    color: 'from-yellow-400 to-orange-600'
  },
  {
    icon: '🔄',
    title: 'Entscheidungspunkte',
    description: 'Visualisiere Wenn-Dann-Szenarien und unterschiedliche Prozesspfade für verschiedene Situationen.',
    color: 'from-green-400 to-green-600'
  },
  {
    icon: '📱',
    title: 'Überall Verfügbar',
    description: 'Funktioniert auf Desktop, Tablet und Smartphone. Dein Prozess ist immer dabei.',
    color: 'from-indigo-400 to-indigo-600'
  }
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-32 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Smooth gradient overlay from hero section */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-full border border-white/30 shadow-lg mb-6">
            <span className="text-sm text-white font-semibold tracking-wide">✨ FEATURES</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Warum Processorix? 🌟
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light leading-relaxed">
            Die moderne Art, Prozesse zu verstehen, zu dokumentieren und zu optimieren.
            Gemeinsam mit deinem Team.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl p-8 rounded-3xl shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform hover:-translate-y-3 hover:scale-105 border border-white/20 hover:border-indigo-400/50"
            >
              {/* Icon with gradient background */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} mb-6 text-4xl shadow-2xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                {feature.description}
              </p>

              {/* Decorative gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-15 rounded-3xl transition-opacity duration-300 pointer-events-none`}></div>
              
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
