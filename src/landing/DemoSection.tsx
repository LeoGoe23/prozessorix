import React, { useState } from 'react';

interface DemoPlayer {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;
}

interface DemoStep {
  id: number;
  from: string;
  to: string;
  action: string;
  medium: string;
  description: string;
}

const demoPlayers: DemoPlayer[] = [
  { id: '1', name: 'Kunde', role: 'Besteller', icon: '😊', color: 'bg-blue-500' },
  { id: '2', name: 'Kassierer', role: 'Aufnehmer', icon: '👨‍💼', color: 'bg-green-500' },
  { id: '3', name: 'Küche', role: 'Zubereiter', icon: '👨‍🍳', color: 'bg-orange-500' },
  { id: '4', name: 'Ausgabe', role: 'Ausgeber', icon: '🎯', color: 'bg-purple-500' }
];

const demoSteps: DemoStep[] = [
  {
    id: 1,
    from: 'Kunde',
    to: 'Kassierer',
    action: 'Bestellung aufgeben',
    medium: 'Mündlich am Tresen',
    description: '🍔 "Ein Big Mac Menü bitte!"'
  },
  {
    id: 2,
    from: 'Kassierer',
    to: 'Kassierer',
    action: 'Bestellung eingeben',
    medium: 'Kassensystem',
    description: '💻 Eingabe in das POS-System'
  },
  {
    id: 3,
    from: 'Kassierer',
    to: 'Kunde',
    action: 'Preis nennen',
    medium: 'Mündlich',
    description: '💰 "Das macht 8,50€ bitte"'
  },
  {
    id: 4,
    from: 'Kunde',
    to: 'Kassierer',
    action: 'Bezahlung',
    medium: 'Kartenzahlung',
    description: '💳 Kontaktlose Zahlung'
  },
  {
    id: 5,
    from: 'Kassierer',
    to: 'Küche',
    action: 'Auftrag weiterleiten',
    medium: 'Monitor/Bon',
    description: '🖥️ Bestellung erscheint auf Küchen-Display'
  },
  {
    id: 6,
    from: 'Küche',
    to: 'Küche',
    action: 'Burger zubereiten',
    medium: 'Grill & Friteuse',
    description: '🍳 Big Mac zusammenstellen, Pommes frittieren'
  },
  {
    id: 7,
    from: 'Küche',
    to: 'Ausgabe',
    action: 'Bestellung bereitstellen',
    medium: 'Tablett/Theke',
    description: '📦 Menü in Tasche packen'
  },
  {
    id: 8,
    from: 'Ausgabe',
    to: 'Kunde',
    action: 'Bestellung ausgeben',
    medium: 'Persönlich',
    description: '🎉 "Bestellung Nr. 42, viel Spaß!"'
  }
];

const DemoSection: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const nextStep = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const autoPlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= demoSteps.length - 1) {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 2000);
  };

  const currentDemoStep = demoSteps[currentStep];

  return (
    <section id="demo" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-4">
            Wie funktioniert's? 🎬
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-2">
            Ein einfaches Beispiel: <strong>McDonald's Bestellung</strong>
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Sieh dir an, wie ein alltäglicher Prozess mit Processorix visualisiert wird
          </p>
        </div>

        {/* Demo Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Players */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Beteiligte im Prozess
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {demoPlayers.map((player) => {
                const isActive = 
                  currentDemoStep.from === player.name || 
                  currentDemoStep.to === player.name;
                
                return (
                  <div
                    key={player.id}
                    className={`flex flex-col items-center p-6 rounded-2xl transition-all duration-500 ${
                      isActive
                        ? 'bg-gradient-to-br from-blue-100 to-purple-100 shadow-lg scale-110 ring-4 ring-blue-300'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className={`text-5xl mb-3 transform transition-all duration-300 ${
                      isActive ? 'animate-bounce-gentle' : ''
                    }`}>
                      {player.icon}
                    </div>
                    <div className={`w-12 h-12 ${player.color} rounded-full mb-2 shadow-md`}></div>
                    <p className="font-bold text-gray-800">{player.name}</p>
                    <p className="text-sm text-gray-500">{player.role}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Step Display */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="text-sm font-semibold mb-2 opacity-90">
                  Schritt {currentStep + 1} von {demoSteps.length}
                </div>
                <h4 className="text-3xl font-bold mb-4">
                  {currentDemoStep.action}
                </h4>
              </div>
              <div className="text-6xl opacity-80 animate-pulse-slow">
                🔄
              </div>
            </div>
            
            <div className="space-y-3 bg-white/10 rounded-xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <span className="font-semibold">Von:</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{currentDemoStep.from}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">Zu:</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{currentDemoStep.to}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">Medium:</span>
                <span className="bg-white/20 px-4 py-2 rounded-full">{currentDemoStep.medium}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20">
                <p className="text-lg">{currentDemoStep.description}</p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Fortschritt</span>
              <span>{Math.round(((currentStep + 1) / demoSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md"
            >
              ⬅️ Zurück
            </button>
            
            <button
              onClick={autoPlay}
              disabled={isPlaying || currentStep === demoSteps.length - 1}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              ▶️ Automatisch abspielen
            </button>

            <button
              onClick={nextStep}
              disabled={currentStep === demoSteps.length - 1}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              Weiter ➡️
            </button>

            <button
              onClick={resetDemo}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200 hover:shadow-md"
            >
              🔄 Neustart
            </button>
          </div>

          {/* Call to Action */}
          {currentStep === demoSteps.length - 1 && (
            <div className="mt-12 text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 animate-fade-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                🎉 Demo abgeschlossen!
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                So einfach kannst du mit Processorix eigene Prozesse erstellen und visualisieren
              </p>
              <button
                onClick={() => window.location.href = '/?game=NEW'}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Jetzt eigenen Prozess erstellen 🚀
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-lg">
            Dies ist nur ein einfaches Beispiel. Mit Processorix kannst du <strong>beliebig komplexe Prozesse</strong> erstellen
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              ✅ Entscheidungspunkte
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              ✅ Parallele Prozesse
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              ✅ Schleifen & Wiederholungen
            </span>
            <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              ✅ Dokumente & Medien
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 1s infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </section>
  );
};

export default DemoSection;
