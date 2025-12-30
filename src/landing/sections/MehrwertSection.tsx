import React from 'react';

interface Mehrwert {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}

const mehrwerte: Mehrwert[] = [
  {
    icon: '👥',
    title: 'Prozesse spielerisch designen',
    description: 'Komplexe Abläufe werden im Spiel greifbar und intuitiv erlebbar. So entstehen bessere Prozesse mit Spaß statt Frust.',
    gradient: 'from-blue-500/80 to-blue-600/80'
  },
  {
    icon: '🎯',
    title: 'Gleiches Prozessverständis für alle Beteiligten',
    description: 'Alle Beteiligten entwickeln ein gemeinsames Bild des Prozesses – unabhängig von Rolle oder Fachbereich. So entstehen Klarheit, Verständnis und eine gemeinsame Sprache.',
    gradient: 'from-purple-500/80 to-purple-600/80'
  },
  {
    icon: '📋',
    title: 'Prozessdokumentation automatisch erstellen',
    description: 'Die im Spiel entwickelten Prozesse werden direkt dokumentiert. Aufwändige Nacharbeit entfällt – die Dokumentation entsteht quasi nebenbei.',
    gradient: 'from-pink-500/80 to-pink-600/80'
  },
  {
    icon: '⚡',
    title: 'Prozessschulungsvideo erstellen',
    description: 'Aus dem gestalteten Prozess entsteht automatisch ein verständliches Schulungsvideo. So werden Abläufe schnell erklärt und nachhaltig vermittelt.',
    gradient: 'from-orange-500/80 to-orange-600/80'
  },
  {
    icon: '🔄',
    title: 'Prozessfehler finden',
    description: 'Schwachstellen, Brüche und Unklarheiten werden im Spiel sofort sichtbar. Fehler lassen sich früh erkennen und gezielt beheben, bevor sie Wirkung entfalten.',
    gradient: 'from-green-500/80 to-green-600/80'
  },
  {
    icon: '🚀',
    title: 'Prozesse automatisch digitalisieren',
    description: 'Die im Spiel entwickelten Prozesse werden direkt in digitale Prozessschritte überführt. So entsteht nahtlos die Basis für IT-Systeme, Automatisierung und Workflow-Tools.',
    gradient: 'from-indigo-500/80 to-indigo-600/80'
  }
];

const MehrwertSection: React.FC = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Smooth top gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none z-10"></div>
      
      {/* Background */}
      <div className="absolute inset-0 bg-slate-950"></div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }}></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-full border border-green-400/20 mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-bold text-green-400 tracking-wider">DER MEHRWERT VON PROZESSORIX</span>
          </div>
        </div>

        {/* Grid Layout - redesigned */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mehrwerte.map((item, index) => (
            <div
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full bg-slate-900/40 backdrop-blur-sm rounded-3xl p-8 border border-slate-800/50 hover:border-slate-700 transition-all duration-500 hover:transform hover:-translate-y-2">
                {/* Gradient background on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 rounded-3xl transition-opacity duration-500 blur-xl -z-10`}></div>
                
                {/* Icon with gradient background */}
                <div className="relative mb-6">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${item.gradient} shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                    <span className="text-4xl">{item.icon}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-4 leading-tight group-hover:text-emerald-300 transition-colors duration-300">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 leading-relaxed text-base group-hover:text-gray-300 transition-colors duration-300">
                  {item.description}
                </p>

                {/* Bottom gradient line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-b-3xl`}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smooth bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none z-10"></div>
    </section>
  );
};

export default MehrwertSection;
