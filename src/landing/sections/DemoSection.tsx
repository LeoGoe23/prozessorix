import React, { useState } from 'react';

type DemoStep = {
  id: number;
  actor: string;
  action: string;
  icon: string;
  color: string;
  input?: string;
  output?: string;
  medium?: string;
};

const DemoSection: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const demoSteps: DemoStep[] = [
    {
      id: 1,
      actor: 'Kunde',
      action: 'Betritt Restaurant',
      icon: '🚶',
      color: 'bg-blue-500',
      output: 'Wartet in Schlange',
      medium: 'Persönlich'
    },
    {
      id: 2,
      actor: 'Kunde',
      action: 'Schaut Menü an',
      icon: '📋',
      color: 'bg-blue-500',
      input: 'Menü-Tafel',
      output: 'Bestellung überlegt'
    },
    {
      id: 3,
      actor: 'Kunde',
      action: 'Gibt Bestellung auf',
      icon: '🗣️',
      color: 'bg-blue-500',
      input: 'Entscheidung',
      output: 'BigMac Menü, Cola',
      medium: 'Mündlich'
    },
    {
      id: 4,
      actor: 'Kassierer',
      action: 'Nimmt Bestellung entgegen',
      icon: '💻',
      color: 'bg-green-500',
      input: 'Bestellung (mündlich)',
      output: 'Bestellung im System',
      medium: 'Kassen-System'
    },
    {
      id: 5,
      actor: 'Kassierer',
      action: 'Nennt Preis',
      icon: '💰',
      color: 'bg-green-500',
      input: 'Summe aus System',
      output: '8,50 €',
      medium: 'Mündlich'
    },
    {
      id: 6,
      actor: 'Kunde',
      action: 'Bezahlt',
      icon: '💳',
      color: 'bg-blue-500',
      input: '8,50 €',
      output: 'Zahlung',
      medium: 'Kartenzahlung'
    },
    {
      id: 7,
      actor: 'Küche',
      action: 'Erhält Bestellung',
      icon: '🍳',
      color: 'bg-orange-500',
      input: 'Digitaler Bestellbon',
      output: 'Bestellung in Arbeit',
      medium: 'Display'
    },
    {
      id: 8,
      actor: 'Küche',
      action: 'Bereitet Essen zu',
      icon: '🍔',
      color: 'bg-orange-500',
      input: 'Zutaten',
      output: 'Fertiges Menü',
      medium: 'Küchengeräte'
    },
    {
      id: 9,
      actor: 'Küche',
      action: 'Stellt Essen bereit',
      icon: '✅',
      color: 'bg-orange-500',
      input: 'Fertiges Menü',
      output: 'Essen auf Theke',
      medium: 'Ausgabe-Theke'
    },
    {
      id: 10,
      actor: 'Kassierer',
      action: 'Ruft Nummer auf',
      icon: '📢',
      color: 'bg-green-500',
      input: 'Bestellnummer',
      output: '"Nummer 42!"',
      medium: 'Durchsage'
    },
    {
      id: 11,
      actor: 'Kunde',
      action: 'Holt Essen ab',
      icon: '🎉',
      color: 'bg-blue-500',
      input: 'Bestellnummer',
      output: 'Erhält Menü',
      medium: 'Persönlich'
    },
    {
      id: 12,
      actor: 'Kunde',
      action: 'Genießt Essen',
      icon: '😋',
      color: 'bg-blue-500',
      input: 'BigMac Menü',
      output: 'Zufriedener Kunde',
      medium: 'Am Tisch'
    }
  ];

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < demoSteps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          clearInterval(interval);
          return prev;
        }
      });
    }, 1500);
  };

  const currentStepData = demoSteps[currentStep];
  const progress = ((currentStep + 1) / demoSteps.length) * 100;

  return (
    <section id="demo" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-black text-gray-800 mb-4">
            Sieh es in Aktion! 🎬
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ein einfaches Beispiel: Eine McDonald's Bestellung als Prozess visualisiert
          </p>
        </div>

        {/* Demo Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-600">
                Schritt {currentStep + 1} von {demoSteps.length}
              </span>
              <span className="text-sm font-semibold text-gray-600">
                {Math.round(progress)}% abgeschlossen
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step Display */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className={`${currentStepData.color} text-white text-5xl w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg`}>
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-800 mb-1">
                  {currentStepData.actor}
                </h3>
                <p className="text-xl text-gray-600">
                  {currentStepData.action}
                </p>
              </div>
            </div>

            {/* Input/Output Flow */}
            <div className="grid md:grid-cols-3 gap-4 mt-6">
              {currentStepData.input && (
                <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                  <div className="text-xs font-semibold text-blue-600 mb-1">INPUT</div>
                  <div className="font-medium text-gray-800">{currentStepData.input}</div>
                </div>
              )}
              {currentStepData.medium && (
                <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                  <div className="text-xs font-semibold text-purple-600 mb-1">MEDIUM</div>
                  <div className="font-medium text-gray-800">{currentStepData.medium}</div>
                </div>
              )}
              {currentStepData.output && (
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                  <div className="text-xs font-semibold text-green-600 mb-1">OUTPUT</div>
                  <div className="font-medium text-gray-800">{currentStepData.output}</div>
                </div>
              )}
            </div>
          </div>

          {/* Mini Timeline */}
          <div className="mb-8 overflow-x-auto pb-4">
            <div className="flex gap-2 min-w-max">
              {demoSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center cursor-pointer transition-all ${
                    index === currentStep
                      ? 'scale-110'
                      : index < currentStep
                      ? 'opacity-60'
                      : 'opacity-30'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={`${step.color} text-white w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-md`}
                  >
                    {step.icon}
                  </div>
                  <div className="text-xs mt-1 text-center w-16 text-gray-600 font-medium">
                    {step.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 transition-all"
            >
              ← Zurück
            </button>
            
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                ▶ Automatisch abspielen
              </button>
            ) : (
              <button
                className="px-8 py-3 bg-gray-400 text-white rounded-full font-bold cursor-not-allowed"
                disabled
              >
                ⏸ Läuft...
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={currentStep === demoSteps.length - 1}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-300 transition-all"
            >
              Weiter →
            </button>

            <button
              onClick={handleReset}
              className="px-6 py-3 bg-red-100 text-red-600 rounded-full font-semibold hover:bg-red-200 transition-all"
            >
              ↺ Neustart
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-100">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2">So funktioniert Prozessorix</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Dieser einfache Bestellprozess zeigt, wie Prozessorix Abläufe visualisiert: 
                  Akteure, ihre Handlungen, Eingaben, Ausgaben und Kommunikationswege werden sichtbar. 
                  Mit Prozessorix könnt ihr eure eigenen Prozesse genauso einfach darstellen und analysieren!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
