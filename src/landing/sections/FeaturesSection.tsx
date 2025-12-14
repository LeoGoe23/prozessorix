import React from 'react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: '🎯',
      title: 'Prozesse visualisieren',
      description: 'Macht komplexe Abläufe auf einen Blick verständlich – für alle im Team.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: '🔄',
      title: 'Echtzeit-Kollaboration',
      description: 'Arbeitet zusammen, seht sofort die Änderungen anderer und entwickelt gemeinsam.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: '🎨',
      title: 'Flexible Darstellung',
      description: 'Verschiedene Ansichten: Spieler-zentriert, Prozess-zentriert oder klassische Swimlanes.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: '📊',
      title: 'Schnittstellen erkennen',
      description: 'Identifiziert automatisch Übergabepunkte und Kommunikationswege zwischen den Beteiligten.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: '🔍',
      title: 'Optimierung leicht gemacht',
      description: 'Engpässe und Verbesserungspotenziale werden sichtbar – so könnt ihr gezielt optimieren.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: '🚀',
      title: 'Schnell einsetzbar',
      description: 'Keine Installation, keine Anmeldung – einfach Link teilen und loslegen.',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  return (
    <section className="py-20 px-6 bg-white relative">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-4">
            Warum Prozessorix?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ein Werkzeug, das Prozessmanagement revolutioniert – spielerisch, kollaborativ und effektiv.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Icon */}
              <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              
              {/* Title */}
              <h3 className={`text-2xl font-bold mb-3 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                {feature.title}
              </h3>
              
              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover decoration */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`}></div>
            </div>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">
            Perfekt für...
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="text-4xl mb-3">🏢</div>
              <h4 className="font-bold text-lg mb-2">Unternehmen</h4>
              <p className="text-sm text-gray-600">Workflows optimieren</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">🎓</div>
              <h4 className="font-bold text-lg mb-2">Workshops</h4>
              <p className="text-sm text-gray-600">Prozesse gemeinsam erarbeiten</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">📚</div>
              <h4 className="font-bold text-lg mb-2">Training</h4>
              <p className="text-sm text-gray-600">Abläufe vermitteln</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-3">💡</div>
              <h4 className="font-bold text-lg mb-2">Beratung</h4>
              <p className="text-sm text-gray-600">Prozesse analysieren</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
