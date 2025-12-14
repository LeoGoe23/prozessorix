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
    <section id="features" className="py-24 px-6 bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
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
              className="group relative bg-slate-800/60 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 transform hover:-translate-y-2 border border-slate-700/50 hover:border-indigo-500/50"
            >
              {/* Icon with gradient background */}
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 text-3xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300 pointer-events-none`}></div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
