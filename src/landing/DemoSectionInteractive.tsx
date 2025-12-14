import React, { useState, useRef } from 'react';

interface DemoPlayer {
  id: string;
  name: string;
  icon: string;
  color: string;
  position?: { x: number; y: number };
  onBoard: boolean;
  role: string;
}

interface ProcessStep {
  id: string;
  from: string;
  to: string;
  text: string;
  medium: string;
  icon: string;
  created: boolean;
}

const DemoSectionInteractive: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [players, setPlayers] = useState<DemoPlayer[]>([
    { id: '1', name: 'Kunde', icon: '😊', color: '#3B82F6', onBoard: false, role: 'Besteller' },
    { id: '2', name: 'Kassierer', icon: '👨‍💼', color: '#10B981', onBoard: false, role: 'Aufnehmer' },
    { id: '3', name: 'Küche', icon: '👨‍🍳', color: '#F59E0B', onBoard: false, role: 'Zubereiter' },
    { id: '4', name: 'Ausgabe', icon: '🎯', color: '#8B5CF6', onBoard: false, role: 'Ausgeber' },
  ]);

  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([
    { id: '1', from: '1', to: '2', text: 'Big Mac Menü bestellen', medium: 'Mündlich', icon: '💬', created: false },
    { id: '2', from: '2', to: '3', text: 'Auftrag weiterleiten', medium: 'Display', icon: '🖥️', created: false },
    { id: '3', from: '3', to: '4', text: 'Menü zubereiten', medium: 'Essens-Tablett', icon: '🍔', created: false },
    { id: '4', from: '4', to: '1', text: 'Bestellung ausgeben', medium: 'Persönlich', icon: '🎉', created: false },
  ]);

  const [draggedPlayer, setDraggedPlayer] = useState<string | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const steps = [
    'Ziehe "Kunde" auf das Board',
    'Ziehe "Kassierer" auf das Board',
    'Ziehe "Küche" auf das Board',
    'Ziehe "Ausgabe" auf das Board',
    'Klicke: Big Mac Menü bestellen',
    'Klicke: Auftrag weiterleiten',
    'Klicke: Menü zubereiten',
    'Klicke: Bestellung ausgeben',
  ];

  const handleDragStart = (playerId: string) => {
    setDraggedPlayer(playerId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!draggedPlayer || !boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const positions: { [key: string]: { x: number; y: number } } = {
      '1': { x: 20, y: 50 },
      '2': { x: 40, y: 30 },
      '3': { x: 60, y: 30 },
      '4': { x: 80, y: 50 },
    };

    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
      const pos = positions[draggedPlayer] || { x, y };
      setPlayers(players.map(p =>
        p.id === draggedPlayer ? { ...p, onBoard: true, position: pos } : p
      ));
      
      if (currentStep < 4) {
        setTimeout(() => setCurrentStep(currentStep + 1), 500);
      }
    }

    setDraggedPlayer(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const createProcessStep = (stepId: string) => {
    setProcessSteps(processSteps.map(s => 
      s.id === stepId ? { ...s, created: true } : s
    ));
    
    if (currentStep < steps.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 500);
    }
  };

  const allPlayersOnBoard = players.every(p => p.onBoard);
  const allProcessStepsCreated = processSteps.every(s => s.created);

  const getPlayerById = (id: string) => players.find(p => p.id === id);

  const renderConnections = () => {
    return processSteps.filter(s => s.created).map((step) => {
      const fromPlayer = getPlayerById(step.from);
      const toPlayer = getPlayerById(step.to);
      
      if (!fromPlayer?.position || !toPlayer?.position) return null;

      return (
        <line
          key={step.id}
          x1={`${fromPlayer.position.x}%`}
          y1={`${fromPlayer.position.y}%`}
          x2={`${toPlayer.position.x}%`}
          y2={`${toPlayer.position.y}%`}
          stroke="url(#gradient)"
          strokeWidth="3"
          strokeDasharray="8 4"
          className="animate-dash"
          markerEnd="url(#arrowhead)"
        />
      );
    });
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setPlayers(players.map(p => ({ ...p, onBoard: false, position: undefined })));
    setProcessSteps(processSteps.map(s => ({ ...s, created: false })));
  };

  return (
    <section className="relative py-32 px-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-slate-950 to-transparent pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-full border border-white/30 shadow-lg mb-6">
            <span className="text-sm text-white font-semibold tracking-wide">🎬 LIVE DEMO</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Sieh es in Aktion
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto font-light">
            Interaktive Demo: McDonald's Bestellprozess
          </p>
        </div>

        <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Top Bar - Instructions */}
          <div className="bg-slate-800/90 backdrop-blur-xl border-b border-indigo-500/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {currentStep + 1}
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    {currentStep < steps.length ? steps[currentStep] : 'Fertig! 🎉'}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500"
                      style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">{currentStep + 1}/{steps.length}</span>
                </div>
              </div>
              <button
                onClick={resetDemo}
                className="ml-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all text-sm"
              >
                Neustart
              </button>
            </div>
          </div>

          {/* Main Board */}
          <div className="relative" style={{ height: '500px' }}>
            <div
              ref={boardRef}
              onDrop={handleDragEnd}
              onDragOver={handleDragOver}
              className="w-full h-full relative bg-slate-900/30"
            >
              {/* Grid Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="w-full h-full" style={{
                  backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)',
                  backgroundSize: '30px 30px'
                }} />
              </div>

              {/* SVG for Connections */}
              {processSteps.some(s => s.created) && (
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#8b5cf6" />
                    </marker>
                  </defs>
                  {renderConnections()}
                </svg>
              )}

              {/* Players on Board */}
              {players.filter(p => p.onBoard && p.position).map((player) => (
                <div
                  key={player.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-fade-in"
                  style={{
                    left: `${player.position!.x}%`,
                    top: `${player.position!.y}%`,
                  }}
                >
                  <div
                    className="rounded-2xl p-6 shadow-2xl border-2 backdrop-blur-sm"
                    style={{
                      backgroundColor: `${player.color}20`,
                      borderColor: player.color,
                    }}
                  >
                    <div className="text-4xl mb-2 text-center">{player.icon}</div>
                    <div className="text-white font-semibold text-center whitespace-nowrap">
                      {player.name}
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {!players.some(p => p.onBoard) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-6xl mb-4 opacity-20">⚙️</div>
                    <p className="text-gray-500 text-lg">Ziehe Spieler von unten hierher</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Bar - Warteliste */}
          <div className="bg-slate-800/90 backdrop-blur-xl border-t border-indigo-500/20 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-semibold text-lg flex items-center gap-2">
                  <span>👥</span> Wartebereich
                </h4>
                <p className="text-gray-400 text-sm">Ziehe Spieler auf das Board</p>
              </div>
              {allPlayersOnBoard && !allProcessStepsCreated && (
                <div className="text-green-400 text-sm font-semibold">
                  ✅ Jetzt Prozesse erstellen →
                </div>
              )}
            </div>

            {/* Waiting Players */}
            <div className="flex gap-4 mb-6">
              {players.filter(p => !p.onBoard).map((player, index) => {
                const isHighlighted = currentStep < 4 && index === currentStep;
                return (
                  <div
                    key={player.id}
                    draggable
                    onDragStart={() => handleDragStart(player.id)}
                    className={`relative flex-1 bg-slate-700/50 rounded-xl p-4 cursor-move hover:bg-slate-700 transition-all border-2 ${
                      isHighlighted ? 'border-yellow-400 animate-pulse-border shadow-lg shadow-yellow-400/50' : 'border-slate-600'
                    }`}
                    style={{ borderLeftColor: player.color, borderLeftWidth: '4px' }}
                  >
                    {isHighlighted && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs animate-bounce">
                        !
                      </div>
                    )}
                    <div className="text-3xl mb-2 text-center">{player.icon}</div>
                    <div className="text-white font-semibold text-center text-sm">{player.name}</div>
                    <div className="text-gray-400 text-xs text-center">{player.role}</div>
                  </div>
                );
              })}
            </div>

            {/* Process Steps */}
            {allPlayersOnBoard && (
              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span>🔄</span> Prozessschritte erstellen
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {processSteps.map((step, index) => {
                    const fromPlayer = getPlayerById(step.from);
                    const toPlayer = getPlayerById(step.to);
                    const isHighlighted = currentStep >= 4 && currentStep - 4 === index && !step.created;
                    
                    return (
                      <button
                        key={step.id}
                        onClick={() => !step.created && createProcessStep(step.id)}
                        disabled={step.created}
                        className={`relative text-left p-4 rounded-xl transition-all ${
                          step.created 
                            ? 'bg-green-500/20 border-2 border-green-500/50 cursor-default' 
                            : isHighlighted
                            ? 'bg-indigo-500/20 border-2 border-yellow-400 animate-pulse-border shadow-lg shadow-yellow-400/50 cursor-pointer hover:bg-indigo-500/30'
                            : 'bg-slate-700/30 border-2 border-slate-600 cursor-pointer hover:bg-slate-700/50'
                        }`}
                      >
                        {isHighlighted && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold text-xs animate-bounce">
                            !
                          </div>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{step.icon}</span>
                          <div className="flex-1">
                            <div className="text-white font-semibold text-sm">{step.text}</div>
                            <div className="text-gray-400 text-xs">{step.medium}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <span style={{ color: fromPlayer?.color }}>{fromPlayer?.icon}</span>
                            <span className="text-gray-400">{fromPlayer?.name}</span>
                          </div>
                          <span className="text-gray-500">→</span>
                          <div className="flex items-center gap-1">
                            <span style={{ color: toPlayer?.color }}>{toPlayer?.icon}</span>
                            <span className="text-gray-400">{toPlayer?.name}</span>
                          </div>
                        </div>
                        {step.created && (
                          <div className="absolute top-2 right-2 text-green-400 text-xl">✓</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          {allProcessStepsCreated && (
            <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border-t border-green-500/30 p-6 text-center animate-fade-in">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold text-white mb-2">Prozess erfolgreich visualisiert!</h3>
              <p className="text-gray-300 mb-6">So einfach funktioniert Processorix mit deinem Team</p>
              <button
                onClick={() => window.location.href = '/?game=NEW'}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-full hover:shadow-lg transition-all"
              >
                Jetzt eigenen Prozess erstellen 🚀
              </button>
            </div>
          )}
        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
          @keyframes dash {
            to { stroke-dashoffset: -100; }
          }
          .animate-dash {
            animation: dash 20s linear infinite;
          }
          @keyframes pulse-border {
            0%, 100% { box-shadow: 0 0 0 0 rgba(250, 204, 21, 0.4); }
            50% { box-shadow: 0 0 0 8px rgba(250, 204, 21, 0); }
          }
          .animate-pulse-border {
            animation: pulse-border 2s infinite;
          }
        `}</style>
      </div>
    </section>
  );
};

export default DemoSectionInteractive;
