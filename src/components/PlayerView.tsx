import React, { useState } from 'react';
import { Player, ProcessCard, PLAYER_COLORS, PLAYER_ICONS, DEFAULT_ROLES } from '../types/game';
import { GitBranch, User, ArrowRight, CheckCircle, Users } from 'lucide-react';

interface PlayerViewProps {
  players: Player[];
  cards: ProcessCard[];
  onAddPlayer: (player: Player) => void;
  onAddCard: (text: string, fromPlayerId: string, toPlayerId: string, medium?: string, duration?: string, description?: string) => void;
  onSwitchToMasterView?: () => void;
}

const PlayerView: React.FC<PlayerViewProps> = ({
  players,
  cards,
  onAddPlayer,
  onAddCard,
  onSwitchToMasterView,
}) => {
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(PLAYER_ICONS[0]);
  const [input] = useState('');
  const [output] = useState('');
  const [medium] = useState('');
  const [processRole] = useState('');
  const [processText, setProcessText] = useState('');
  const [selectedToPlayer, setSelectedToPlayer] = useState<string | null>(null);
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [inspectedPlayer, setInspectedPlayer] = useState<string | null>(null);
  const [inspectedProcessStep, setInspectedProcessStep] = useState<string | null>(null);
  const [cardType, setCardType] = useState<'process' | 'system' | 'communication' | 'connector'>('process');
  
  // Kommunikationsmittel State
  const [communicationMethods, setCommunicationMethods] = useState<Array<{ id: string; icon: string; name: string; description?: string }>>([
    { id: '1', icon: '📧', name: 'E-Mail', description: 'Schriftliche Kommunikation' },
    { id: '2', icon: '📞', name: 'Telefon', description: 'Direkter Anruf' },
    { id: '3', icon: '💬', name: 'Chat', description: 'Instant Messaging' },
    { id: '4', icon: '📋', name: 'Formular', description: 'Strukturierte Eingabe' },
  ]);
  const [selectedCommMethod, setSelectedCommMethod] = useState<string | null>(null);
  const [processCommMethods, setProcessCommMethods] = useState<{ [processId: string]: string[] }>({});

  // Dynamische Icon-Auswahl basierend auf der Rolle
  const getIconsForRole = (roleName: string): string[] => {
    const roleIcons: { [key: string]: string[] } = {
      'Vertrieb': ['💼', '📊', '📈', '💰', '🎯'],
      'HR': ['👥', '👤', '🎓', '👔', '📋'],
      'Kunde': ['🛒', '💳', '⭐', '😊', '🏪'],
      'Manager': ['👨‍💼', '👩‍💼', '📊', '🏢', '💼'],
      'IT': ['💻', '👨‍💻', '👩‍💻', '🖥', '⚙'],
      'Produktion': ['🏭', '⚙', '🔧', '🛠', '⚡'],
    };

    const normalizedRole = roleName.trim().toLowerCase();
    for (const [key, icons] of Object.entries(roleIcons)) {
      if (key.toLowerCase() === normalizedRole) {
        return icons;
      }
    }
    
    // Fallback: Erste 5 Icons
    return ['💼', '👤', '📊', '💻', '🎯'];
  };

  const filteredIcons = role ? getIconsForRole(role) : ['💼', '👤', '📊', '💻', '🎯'];

  // Registration
  const handleRegister = () => {
    if (!name.trim() || !role.trim()) return;

    const randomColor = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      color: randomColor,
      icon: selectedIcon,
      description: description.trim() || undefined,
      input: input.trim() || undefined,
      output: output.trim() || undefined,
      medium: medium.trim() || undefined,
      processRole: processRole.trim() || undefined,
      onBoard: false, // Spieler startet im Wartebereich
    };

    console.log('🎮 PlayerView: Registering player:', newPlayer);
    onAddPlayer(newPlayer);
    setMyPlayer(newPlayer);
    console.log('✅ PlayerView: onAddPlayer called, myPlayer set');
  };

  // Add test players
  // Add process step
  const handleAddProcess = () => {
    if (!myPlayer || !processText.trim() || !selectedToPlayer) return;

    // Kommunikationsmittel-Namen als medium übergeben
    const mediumName = selectedCommMethod 
      ? communicationMethods.find(m => m.id === selectedCommMethod)?.name 
      : undefined;

    console.log('🔥 PlayerView: Creating process step:', {
      text: processText.trim(),
      from: myPlayer.id,
      to: selectedToPlayer,
      medium: mediumName
    });

    onAddCard(processText.trim(), myPlayer.id, selectedToPlayer, mediumName);
    
    console.log('✅ PlayerView: onAddCard called');
    
    setProcessText('');
    setSelectedToPlayer(null);
  };

  // Get my process steps
  const mySteps = myPlayer 
    ? cards.filter(c => c.fromPlayerId === myPlayer.id)
    : [];

  // Registration View
  if (!myPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col">
        {/* Header Bar */}
        <header className="bg-slate-800/90 backdrop-blur-xl border-b border-white/10 shadow-xl p-4 z-50">
          <div className="px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Processorix</h1>
                <p className="text-sm text-indigo-300">Kollaboratives Prozess-Mapping</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-12">
          <div className="max-w-[1400px] w-full">
            {/* Header Section */}
            <div className="mb-12 text-center">
              <div className="inline-flex w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl items-center justify-center shadow-lg mb-6">
                <User className="w-11 h-11 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-3">Willkommen!</h1>
              <p className="text-lg text-gray-400">Registriere dich und beschreibe deine Rolle im Prozess</p>
            </div>

          <div className="max-w-3xl mx-auto mb-12">
            {/* Kompakte Grund-Informationen */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 mb-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-400" />
                </div>
                <h2 className="text-2xl font-semibold text-white">Grundinformationen</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Dein Name *
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Anna"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none text-white placeholder-gray-400 transition-all"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Deine Rolle *
                  </label>
                  <input
                    type="text"
                    placeholder="z.B. Manager, Vertrieb, Kunde"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    list="roles"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:outline-none text-white placeholder-gray-400 transition-all"
                  />
                  <datalist id="roles">
                    {DEFAULT_ROLES.map(r => <option key={r} value={r} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wähle dein Icon
                </label>
                <div className="flex gap-2 flex-wrap">
                  {filteredIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setSelectedIcon(icon)}
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${
                        selectedIcon === icon
                          ? 'bg-indigo-500 ring-2 ring-indigo-400 shadow-lg scale-105'
                          : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-600/50 hover:scale-105'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Großes Freitextfeld für Erklärung */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-xl">
                  📝
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Beschreibe deine Rolle</h2>
                  <p className="text-sm text-gray-400">Was machst du? Was sind deine Aufgaben?</p>
                </div>
              </div>
              
              <textarea
                placeholder="Beschreibe hier deine Rolle und Aufgaben im Prozess...\n\nBeispiel:\n- Ich nehme Kundenanfragen entgegen\n- Ich prüfe die Anforderungen\n- Ich leite die Informationen an das Team weiter\n- Ich bin verantwortlich für..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-5 py-4 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-white placeholder-gray-400 transition-all resize-none"
                rows={10}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="max-w-3xl mx-auto">
            <button
              onClick={handleRegister}
              disabled={!name.trim() || !role.trim()}
              className="w-full flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 hover:shadow-2xl hover:scale-[1.02] transition-all font-semibold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-xl"
            >
              <CheckCircle className="w-7 h-7" />
              Beitreten und Prozess-Mapping starten
            </button>

            {/* Status Info */}
            {players.length > 0 && (
              <div className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/30">
                <p className="text-base text-indigo-200 text-center font-medium">
                  🎮 Bereits {players.length} Spieler im Spiel
                </p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    );
  }

  // Player View - Simplified
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex flex-col">
      {/* Header with Player Info */}
      <header className="bg-slate-800/90 backdrop-blur-xl border-b border-white/10 shadow-xl p-4 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
              style={{ backgroundColor: myPlayer.color }}
            >
              {myPlayer.icon}
            </div>
            <div>
              <div className="font-bold text-white text-lg">{myPlayer.name}</div>
              <div className="text-sm text-gray-300">{myPlayer.role}</div>
            </div>
          </div>
          
          {/* Switch to Master View Button */}
          {onSwitchToMasterView && (
            <button
              onClick={onSwitchToMasterView}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors border border-indigo-500/30"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">Gesamtansicht</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-row gap-6 p-6 overflow-hidden">
        <main className={`${inspectedPlayer || inspectedProcessStep ? 'flex-[2]' : 'flex-1'} overflow-y-auto transition-all duration-300 space-y-6`}>
        
        {/* Player Info Card */}
        {myPlayer.description && (
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl border border-indigo-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                📝
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">Deine Rollenbeschreibung</h3>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{myPlayer.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Card Type Selection - Minimalistisch */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 px-1">Objekte</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Prozessschritte */}
            <button
              onClick={() => setCardType('process')}
              className={`group p-5 rounded-xl transition-all ${
                cardType === 'process'
                  ? 'bg-blue-500/10 ring-2 ring-blue-500/50'
                  : 'bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  cardType === 'process' ? 'bg-blue-500/20' : 'bg-slate-700/50'
                }`}>
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white">Prozessschritte</div>
              </div>
            </button>

            {/* Systeme/Tools */}
            <button
              onClick={() => setCardType('system')}
              className={`group p-5 rounded-xl transition-all ${
                cardType === 'system'
                  ? 'bg-teal-500/10 ring-2 ring-teal-500/50'
                  : 'bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  cardType === 'system' ? 'bg-teal-500/20' : 'bg-slate-700/50'
                }`}>
                  <svg className="w-7 h-7 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white">Systeme/Tools</div>
              </div>
            </button>

            {/* Kommunikationsmittel */}
            <button
              onClick={() => setCardType('communication')}
              className={`group p-5 rounded-xl transition-all ${
                cardType === 'communication'
                  ? 'bg-amber-500/10 ring-2 ring-amber-500/50'
                  : 'bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  cardType === 'communication' ? 'bg-amber-500/20' : 'bg-slate-700/50'
                }`}>
                  <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white">Kommunikationsmittel</div>
              </div>
            </button>

            {/* Prozessschrittverbinder */}
            <button
              onClick={() => setCardType('connector')}
              className={`group p-5 rounded-xl transition-all ${
                cardType === 'connector'
                  ? 'bg-red-500/10 ring-2 ring-red-500/50'
                  : 'bg-slate-800/40 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                  cardType === 'connector' ? 'bg-red-500/20' : 'bg-slate-700/50'
                }`}>
                  <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-white">Prozessschrittverbinder</div>
              </div>
            </button>
          </div>
        </div>

        {/* Add Process Step / Communication Method - Verbessert */}
        <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              cardType === 'process' ? 'bg-blue-500/20' :
              cardType === 'system' ? 'bg-teal-500/20' :
              cardType === 'communication' ? 'bg-amber-500/20' :
              'bg-red-500/20'
            }`}>
              {cardType === 'process' && <GitBranch className="w-6 h-6 text-blue-400" />}
              {cardType === 'system' && (
                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
              {cardType === 'communication' && (
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {cardType === 'connector' && (
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {cardType === 'process' && 'Neuer Prozessschritt'}
                {cardType === 'system' && 'Neues System/Tool'}
                {cardType === 'communication' && 'Neues Kommunikationsmittel'}
                {cardType === 'connector' && 'Neuer Prozessschrittverbinder'}
              </h2>
              <p className="text-sm text-gray-400">
                {cardType === 'process' && 'Was übergibst du an wen?'}
                {cardType === 'system' && 'Welches System wird verwendet?'}
                {cardType === 'communication' && 'Wie kommunizierst du?'}
                {cardType === 'connector' && 'Verbindung erstellen'}
              </p>
            </div>
          </div>

          {/* Communication Methods Display */}
          {cardType === 'communication' ? (
            <div className="space-y-5">
              {!selectedCommMethod ? (
                <>
                  {/* Schritt 1: Kommunikationsmittel auswählen */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      💬 Wähle ein Kommunikationsmittel
                    </label>
                    {communicationMethods.length === 0 ? (
                      <div className="bg-slate-700/30 rounded-xl p-8 text-center">
                        <p className="text-gray-400 mb-2">Noch keine Kommunikationsmittel vorhanden</p>
                        <p className="text-sm text-gray-500">Erstelle ein Kommunikationsmittel, um es Prozessen zuzuordnen</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {communicationMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedCommMethod(method.id)}
                            className="flex flex-col gap-3 p-5 rounded-xl bg-slate-700/50 border border-slate-600 hover:border-amber-500 hover:bg-slate-700 transition-all text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">{method.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-base font-semibold text-white truncate">{method.name}</div>
                                {method.description && (
                                  <div className="text-xs text-gray-400 truncate">{method.description}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 pt-2 border-t border-slate-600">
                              Kann Prozessen zugeordnet werden
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Button zum Hinzufügen neuer Kommunikationsmittel */}
                  <div className="pt-4 border-t border-slate-700">
                    <button
                      onClick={() => {
                        const icon = prompt('Wähle ein Emoji-Icon (z.B. 📧, 📞, 💬):');
                        const name = prompt('Name des Kommunikationsmittels:');
                        if (icon && name) {
                          const description = prompt('Beschreibung (optional):');
                          const newMethod = {
                            id: Date.now().toString(),
                            icon: icon,
                            name: name.trim(),
                            description: description || undefined,
                          };
                          setCommunicationMethods([...communicationMethods, newMethod]);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-gray-300 rounded-xl transition-all border border-slate-600 hover:border-amber-500/50"
                    >
                      <span className="text-xl">➕</span>
                      Neues Kommunikationsmittel hinzufügen
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Schritt 2: Ausgewähltes Kommunikationsmittel anzeigen und Prozessen zuordnen */}
                  <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">{communicationMethods.find(m => m.id === selectedCommMethod)?.icon}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-semibold">{communicationMethods.find(m => m.id === selectedCommMethod)?.name}</h4>
                        <p className="text-amber-400/70 text-sm">Ausgewählt</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCommMethod(null)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all text-sm"
                    >
                      Zurück
                    </button>
                  </div>

                  {/* Schritt 3: Prozesse anzeigen und zuordnen */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-3">
                      📋 Wähle Prozesse zum Zuordnen
                    </label>
                    {mySteps.length === 0 ? (
                      <div className="bg-slate-700/30 rounded-xl p-8 text-center">
                        <p className="text-gray-400 mb-2">Noch keine Prozessschritte vorhanden</p>
                        <p className="text-sm text-gray-500">Erstelle zuerst Prozessschritte, um Kommunikationsmittel zuzuordnen</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mySteps.map((step) => {
                          const toPlayer = players.find(p => p.id === step.toPlayerId);
                          const hasCommMethod = processCommMethods[step.id]?.includes(selectedCommMethod);
                          
                          return (
                            <button
                              key={step.id}
                              onClick={() => {
                                setProcessCommMethods(prev => {
                                  const current = prev[step.id] || [];
                                  if (current.includes(selectedCommMethod)) {
                                    // Entfernen
                                    return {
                                      ...prev,
                                      [step.id]: current.filter(id => id !== selectedCommMethod)
                                    };
                                  } else {
                                    // Hinzufügen
                                    return {
                                      ...prev,
                                      [step.id]: [...current, selectedCommMethod]
                                    };
                                  }
                                });
                              }}
                              className={`w-full rounded-xl p-4 border-2 transition-all text-left ${
                                hasCommMethod 
                                  ? 'border-amber-500 bg-amber-500/10' 
                                  : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                  <p className="text-white font-medium mb-2">{step.text}</p>
                                  {toPlayer && (
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                      <span className="text-xs">Von:</span>
                                      <span className="font-medium">{myPlayer.name}</span>
                                      <ArrowRight className="w-3 h-3" />
                                      <span className="text-xs">An:</span>
                                      <div
                                        className="w-5 h-5 rounded flex items-center justify-center text-xs"
                                        style={{ backgroundColor: toPlayer.color }}
                                      >
                                        {toPlayer.icon}
                                      </div>
                                      <span className="font-medium">{toPlayer.name}</span>
                                    </div>
                                  )}
                                </div>
                                {hasCommMethod && (
                                  <div className="text-amber-400 text-xl ml-3">✓</div>
                                )}
                              </div>
                              
                              {/* Zugeordnete Kommunikationsmittel anzeigen */}
                              {processCommMethods[step.id] && processCommMethods[step.id].length > 0 && (
                                <div className="pt-3 border-t border-slate-600">
                                  <div className="text-xs text-gray-400 mb-2">Zugeordnete Kommunikationsmittel:</div>
                                  <div className="flex flex-wrap gap-2">
                                    {processCommMethods[step.id].map(methodId => {
                                      const method = communicationMethods.find(m => m.id === methodId);
                                      return method ? (
                                        <span key={methodId} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs">
                                          <span>{method.icon}</span>
                                          <span>{method.name}</span>
                                        </span>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Process Step Form */

            <div className="space-y-5">
              {/* Prozess-Text mit besserer Beschriftung */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  📋 Was machst du / übergibst du?
                </label>
                <textarea
                  placeholder="Beschreibe den Prozessschritt...&#10;&#10;z.B. 'Kundenanfrage prüfen und kategorisieren'&#10;oder 'Angebot erstellen und per E-Mail versenden'"
                  value={processText}
                  onChange={(e) => setProcessText(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none text-white placeholder-gray-400 min-h-[120px] resize-none transition-all"
                />
              </div>

              {/* Kommunikationsmittel Auswahl */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  📱 Kommunikationsmittel (optional)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {communicationMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedCommMethod(selectedCommMethod === method.id ? null : method.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedCommMethod === method.id
                          ? 'bg-amber-500/20 ring-2 ring-amber-500'
                          : 'bg-slate-700/50 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">{method.name}</div>
                        {method.description && (
                          <div className="text-xs text-gray-400 truncate">{method.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Empfänger-Auswahl schöner gestaltet */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  👥 An wen übergibst du?
                </label>
                {players.filter(p => p.id !== myPlayer.id).length === 0 ? (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                    <p className="text-yellow-300 text-sm">
                      ⏳ Warte auf weitere Spieler...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {players.filter(p => p.id !== myPlayer.id).map((player) => (
                      <button
                        key={player.id}
                        onClick={() => setSelectedToPlayer(player.id)}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          selectedToPlayer === player.id
                            ? 'border-green-500 bg-green-500/10 shadow-lg shadow-green-500/20 scale-[1.02]'
                            : 'border-slate-600 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50'
                        }`}
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md flex-shrink-0"
                          style={{ backgroundColor: player.color }}
                        >
                          {player.icon}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-semibold text-white truncate">{player.name}</div>
                          <div className="text-xs text-gray-400 truncate">{player.role}</div>
                        </div>
                        {selectedToPlayer === player.id && (
                          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Button mit besserem Design */}
              <button
                onClick={() => {
                  handleAddProcess();
                  setSelectedCommMethod(null);
                }}
                disabled={!processText.trim() || !selectedToPlayer}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none text-lg disabled:hover:scale-100 hover:scale-[1.02]"
              >
                <ArrowRight className="w-6 h-6" />
                {selectedCommMethod ? (
                  <>
                    <span className="text-xl">{communicationMethods.find(m => m.id === selectedCommMethod)?.icon}</span>
                    Prozess mit Kommunikationsmittel erstellen
                  </>
                ) : (
                  'Prozessschritt erstellen'
                )}
              </button>
            </div>
          )}
        </div>

        {/* My Process Steps - Verbesserte Darstellung */}
        {mySteps.length > 0 && (
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Meine Prozessschritte</h2>
                <p className="text-sm text-gray-400">{mySteps.length} Schritt{mySteps.length !== 1 ? 'e' : ''} erstellt</p>
              </div>
            </div>
            <div className="space-y-3">
              {mySteps.map((step, index) => {
                const toPlayer = players.find(p => p.id === step.toPlayerId);
                const isSelected = selectedStep === step.id;
                return (
                  <div
                    key={step.id}
                    className={`bg-slate-700/40 rounded-xl border-2 transition-all ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-500/5 shadow-lg shadow-purple-500/10' 
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <button
                      onClick={() => setSelectedStep(isSelected ? null : step.id)}
                      className="w-full p-5 text-left"
                    >
                      {/* Step Number Badge */}
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-300 font-bold text-sm flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-base leading-relaxed mb-3">{step.text}</p>
                          
                          {/* To Player Info */}
                          {toPlayer && (
                            <div className="flex items-center gap-2 bg-slate-600/30 rounded-lg px-3 py-2 w-fit">
                              <ArrowRight className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-400">An:</span>
                              <div
                                className="w-6 h-6 rounded flex items-center justify-center text-sm"
                                style={{ backgroundColor: toPlayer.color }}
                              >
                                {toPlayer.icon}
                              </div>
                              <span className="text-white font-medium text-sm">{toPlayer.name}</span>
                              <span className="text-gray-400 text-xs">({toPlayer.role})</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="mt-3 text-xs text-gray-500 ml-12">
                        🕐 {new Date(step.timestamp).toLocaleString('de-DE', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </button>
                    
                    {/* Details Button */}
                    {isSelected && (
                      <div className="px-5 pb-4 pt-2 border-t border-slate-600">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStep(null);
                            setInspectedProcessStep(step.id);
                          }}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 rounded-lg transition-colors font-medium text-sm"
                        >
                          <GitBranch className="w-4 h-4" />
                          Details anzeigen
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </main>

        {/* Player Inspector Panel */}
        {inspectedPlayer && (() => {
          const player = players.find(p => p.id === inspectedPlayer);
          if (!player) return null;

          const playerSteps = cards.filter(c => c.fromPlayerId === player.id || c.toPlayerId === player.id);
          const stepsFrom = cards.filter(c => c.fromPlayerId === player.id);
          const stepsTo = cards.filter(c => c.toPlayerId === player.id);

          return (
            <div className="flex-1 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-indigo-400/30 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.icon}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                      <p className="text-sm text-gray-400">{player.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedPlayer(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-indigo-500/20 rounded-lg p-3 border border-indigo-500/30">
                    <div className="text-2xl font-bold text-white">{playerSteps.length}</div>
                    <div className="text-xs text-indigo-300">Gesamt</div>
                  </div>
                  <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
                    <div className="text-2xl font-bold text-white">{stepsFrom.length}</div>
                    <div className="text-xs text-purple-300">Gesendet</div>
                  </div>
                  <div className="bg-pink-500/20 rounded-lg p-3 border border-pink-500/30">
                    <div className="text-2xl font-bold text-white">{stepsTo.length}</div>
                    <div className="text-xs text-pink-300">Empfangen</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(player.input || player.output || player.medium || player.processRole) && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📋 Informationen</h3>
                    <div className="space-y-3">
                      {player.input && (
                        <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                          <div className="text-xs font-semibold text-indigo-300 mb-2">📥 Input</div>
                          <div className="text-white">{player.input}</div>
                        </div>
                      )}
                      {player.output && (
                        <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                          <div className="text-xs font-semibold text-purple-300 mb-2">📤 Output</div>
                          <div className="text-white">{player.output}</div>
                        </div>
                      )}
                      {player.medium && (
                        <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                          <div className="text-xs font-semibold text-cyan-300 mb-2">📡 Medium</div>
                          <div className="text-white">{player.medium}</div>
                        </div>
                      )}
                      {player.processRole && (
                        <div className="bg-pink-500/10 rounded-lg p-4 border border-pink-500/20">
                          <div className="text-xs font-semibold text-pink-300 mb-2">👤 Rolle im Prozess</div>
                          <div className="text-white">{player.processRole}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {stepsFrom.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📤 Gesendete Schritte</h3>
                    <div className="space-y-3">
                      {stepsFrom.map((step) => {
                        const toPlayer = players.find(p => p.id === step.toPlayerId);
                        return (
                          <div key={step.id} className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
                            <p className="text-white mb-2">{step.text}</p>
                            {toPlayer && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <ArrowRight className="w-4 h-4" />
                                <span>An: {toPlayer.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {stepsTo.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">📥 Empfangene Schritte</h3>
                    <div className="space-y-3">
                      {stepsTo.map((step) => {
                        const fromPlayer = players.find(p => p.id === step.fromPlayerId);
                        return (
                          <div key={step.id} className="bg-slate-700/50 rounded-lg p-4 border border-white/10">
                            <p className="text-white mb-2">{step.text}</p>
                            {fromPlayer && (
                              <div className="flex items-center gap-2 text-sm text-gray-400">
                                <span>Von: {fromPlayer.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Process Step Inspector Panel */}
        {inspectedProcessStep && (() => {
          const step = cards.find(c => c.id === inspectedProcessStep);
          if (!step) return null;

          const fromPlayer = players.find(p => p.id === step.fromPlayerId);
          const toPlayer = players.find(p => p.id === step.toPlayerId);

          return (
            <div className="flex-1 bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-indigo-400/30 overflow-hidden flex flex-col">
              <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <GitBranch className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Prozessschritt Details</h2>
                      <p className="text-xs text-gray-400">{new Date(step.timestamp).toLocaleString('de-DE')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInspectedProcessStep(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <div className="text-xs font-medium text-gray-400 mb-2">Titel</div>
                  <div className="text-xl font-semibold text-white">{step.text}</div>
                </div>

                <div className="flex items-center gap-4">
                  {fromPlayer && (
                    <div className="flex-1 bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                      <div className="text-xs font-semibold text-yellow-300 mb-2">📤 Von</div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: fromPlayer.color }}
                        >
                          {fromPlayer.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white">{fromPlayer.name}</div>
                          <div className="text-xs text-gray-400">{fromPlayer.role}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-gray-400 text-2xl">→</div>

                  {toPlayer && (
                    <div className="flex-1 bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                      <div className="text-xs font-semibold text-green-300 mb-2">📥 An</div>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                          style={{ backgroundColor: toPlayer.color }}
                        >
                          {toPlayer.icon}
                        </div>
                        <div>
                          <div className="font-medium text-white">{toPlayer.name}</div>
                          <div className="text-xs text-gray-400">{toPlayer.role}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {(step.medium || step.duration || step.description) && (
                  <div className="space-y-3 pt-3 border-t border-white/10">
                    {step.medium && (
                      <div className="bg-cyan-500/10 rounded-lg p-4 border border-cyan-500/20">
                        <div className="text-xs font-semibold text-cyan-300 mb-2">📡 Medium</div>
                        <div className="text-white">{step.medium}</div>
                      </div>
                    )}

                    {step.duration && (
                      <div className="bg-indigo-500/10 rounded-lg p-4 border border-indigo-500/20">
                        <div className="text-xs font-semibold text-indigo-300 mb-2">⏱️ Dauer</div>
                        <div className="text-white">{step.duration}</div>
                      </div>
                    )}

                    {step.description && (
                      <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                        <div className="text-xs font-semibold text-purple-300 mb-2">📝 Beschreibung</div>
                        <div className="text-white whitespace-pre-wrap">{step.description}</div>
                      </div>
                    )}
                  </div>
                )}

                {!step.medium && !step.duration && !step.description && (
                  <div className="text-center py-6 text-gray-400 text-sm bg-slate-700/30 rounded-lg">
                    Keine zusätzlichen Informationen vorhanden
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default PlayerView;
