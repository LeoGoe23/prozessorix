import React, { useState, useEffect } from 'react';
import LandingPage from './landing/LandingPage';
import GameBoard from './components/GameBoard';
import PlayerView from './components/PlayerView';
import { Player, ProcessCard, ProcessObject } from './types/game';
import * as gameService from './firebase/gameService';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState<boolean>(true);
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [cards, setCards] = useState<ProcessCard[]>([]);
  const [processObjects, setProcessObjects] = useState<ProcessObject[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [viewMode, setViewMode] = useState<'master' | 'player'>('master');

  // Initialize: Check URL - Landing Page or Game
  useEffect(() => {
    const initializeApp = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const gameParam = urlParams.get('game');
      const viewParam = urlParams.get('view');
      
      // If no game parameter, show Landing Page
      if (!gameParam) {
        setShowLanding(true);
        setIsInitializing(false);
        return;
      }
      
      // Game mode active
      setShowLanding(false);
      
      // Determine view mode: 'player' if explicitly set, otherwise 'master'
      if (viewParam === 'player') {
        setViewMode('player');
      }
      
      if (gameParam === 'NEW') {
        // Create new game
        const newGameId = gameService.generateGameId();
        await gameService.createGame(newGameId);
        setGameId(newGameId);
        window.history.pushState({}, '', `?game=${newGameId}`);
      } else {
        // Join existing game from URL
        setGameId(gameParam.toUpperCase());
      }
      
      setIsInitializing(false);
    };

    initializeApp();
  }, []);

  // Subscribe to real-time updates when game is joined
  useEffect(() => {
    if (!gameId) return;

    // Subscribe to players
    const unsubscribePlayers = gameService.subscribeToPlayers(gameId, (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Subscribe to process steps
    const unsubscribeSteps = gameService.subscribeToProcessSteps(gameId, (updatedSteps) => {
      setCards(updatedSteps);
    });

    // Subscribe to process objects
    const unsubscribeObjects = gameService.subscribeToProcessObjects(gameId, async (updatedObjects) => {
      setProcessObjects(updatedObjects);
      
      // Initialize default communication objects if none exist
      const hasCommObjects = updatedObjects.some(obj => obj.category === 'communication');
      if (!hasCommObjects) {
        const defaultComms = [
          { name: 'E-Mail', icon: '📧', color: '#3B82F6', category: 'communication' as const },
          { name: 'Telefon', icon: '📞', color: '#10B981', category: 'communication' as const },
          { name: 'Persönlich', icon: '👥', color: '#F59E0B', category: 'communication' as const },
          { name: 'Chat', icon: '💬', color: '#8B5CF6', category: 'communication' as const },
          { name: 'Video-Call', icon: '📹', color: '#EC4899', category: 'communication' as const },
        ];
        
        for (const comm of defaultComms) {
          await gameService.addProcessObject(gameId, comm);
        }
      }
      
      // Clean up old decision icons (❓ and other old ones)
      const oldDecisionIcons = ['❓', '💭', '🤔', '⚖️', '🔷', '◆', '🔶', '❔', '💡', '🎲', '🔺', '🔻', '⚠️', '🔀', '⚡', '🎯'];
      const oldConnectors = updatedObjects.filter(obj => 
        obj.category === 'connector' && oldDecisionIcons.includes(obj.icon)
      );
      for (const oldConnector of oldConnectors) {
        await gameService.removeProcessObject(gameId, oldConnector.id);
      }
      
      // Initialize default decision logic gates if none exist
      const hasXOR = updatedObjects.some(obj => obj.category === 'connector' && obj.icon === '⊕');
      const hasAND = updatedObjects.some(obj => obj.category === 'connector' && obj.icon === '∧');
      const hasOR = updatedObjects.some(obj => obj.category === 'connector' && obj.icon === '∨');
      
      if (!hasXOR) {
        await gameService.addProcessObject(gameId, {
          name: 'XOR (Entweder-oder)',
          icon: '⊕',
          color: '#F59E0B',
          category: 'connector' as const,
          description: 'Exklusive Oder-Entscheidung: Genau eine Option wird gewählt'
        });
      }
      if (!hasAND) {
        await gameService.addProcessObject(gameId, {
          name: 'AND (Und)',
          icon: '∧',
          color: '#3B82F6',
          category: 'connector' as const,
          description: 'Und-Logik: Alle Optionen werden parallel ausgeführt'
        });
      }
      if (!hasOR) {
        await gameService.addProcessObject(gameId, {
          name: 'OR (Oder)',
          icon: '∨',
          color: '#10B981',
          category: 'connector' as const,
          description: 'Oder-Logik: Eine oder mehrere Optionen werden gewählt'
        });
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribePlayers();
      unsubscribeSteps();
      unsubscribeObjects();
    };
  }, [gameId]);

  const addPlayer = async (player: Player) => {
    console.log('🔍 addPlayer called, gameId:', gameId, 'player:', player);
    if (!gameId) {
      console.error('❌ No gameId available!');
      return;
    }
    try {
      await gameService.addPlayer(gameId, player);
      console.log('✅ Player added successfully');
    } catch (error) {
      console.error('❌ Error adding player:', error);
    }
  };

  const removePlayer = async (playerId: string) => {
    if (!gameId) return;
    await gameService.removePlayer(gameId, playerId);
  };

  const updatePlayerPosition = async (playerId: string, position: { x: number; y: number }) => {
    if (!gameId) return;
    
    // Wenn ein Spieler bewegt wird und noch nicht onBoard ist, setze onBoard auf true
    const player = players.find(p => p.id === playerId);
    if (player && player.onBoard === false) {
      // Aktualisiere sowohl Position als auch onBoard Status
      await gameService.updatePlayerPosition(gameId, playerId, position, true);
    } else {
      await gameService.updatePlayerPosition(gameId, playerId, position);
    }
  };

  const addCard = async (
    text: string, 
    fromPlayerId: string, 
    toPlayerId: string,
    medium?: string,
    duration?: string,
    description?: string
  ) => {
    console.log('🔥 App.tsx: addCard called', { text, fromPlayerId, toPlayerId, medium, gameId });
    
    if (!gameId) {
      console.error('❌ App.tsx: No gameId!');
      return;
    }
    
    const fromPlayer = players.find(p => p.id === fromPlayerId);
    if (!fromPlayer) {
      console.error('❌ App.tsx: fromPlayer not found!', fromPlayerId);
      return;
    }
    
    const newCard: ProcessCard = {
      id: `card-${Date.now()}`,
      playerId: fromPlayer.id,
      playerName: fromPlayer.name,
      text,
      round: 1,
      order: cards.length + 1,
      timestamp: Date.now(),
      fromPlayerId,
      toPlayerId,
      medium: medium || undefined,
      duration: duration || undefined,
      description: description || undefined,
    };

    console.log('🔥 App.tsx: Calling gameService.addProcessStep', newCard);
    
    try {
      await gameService.addProcessStep(gameId, newCard);
      console.log('✅ App.tsx: Process step added successfully');
    } catch (error) {
      console.error('❌ App.tsx: Error adding process step:', error);
    }
  };

  const addProcessObject = async (processObject: Omit<ProcessObject, 'id' | 'timestamp'>) => {
    if (!gameId) return;
    await gameService.addProcessObject(gameId, processObject);
  };

  const removeProcessObject = async (objectId: string) => {
    if (!gameId) return;
    await gameService.removeProcessObject(gameId, objectId);
  };

  const updateProcessObject = async (objectId: string, updates: Partial<ProcessObject>) => {
    if (!gameId) return;
    await gameService.updateProcessObject(gameId, objectId, updates);
  };

  const updateCard = async (cardId: string, updates: Partial<ProcessCard>) => {
    if (!gameId) return;
    await gameService.updateProcessStep(gameId, cardId, updates);
  };

  const removeCard = async (cardId: string) => {
    if (!gameId) return;
    await gameService.removeProcessStep(gameId, cardId);
  };

  // Show landing page if no game parameter
  if (showLanding) {
    if (isInitializing) {
      return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-bounce">⚙️</div>
            <div className="text-2xl font-bold text-gray-800">Processorix</div>
          </div>
        </div>
      );
    }
    return <LandingPage />;
  }

  // Show loading while initializing game
  if (isInitializing || !gameId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="text-3xl">🔥</div>
          </div>
          <div className="text-xl font-bold text-white">Processorix wird gestartet...</div>
        </div>
      </div>
    );
  }

  // Show appropriate view based on mode
  if (viewMode === 'player') {
    // Player View - Mobile optimized, simplified
    return (
      <PlayerView
        players={players}
        cards={cards}
        onAddPlayer={addPlayer}
        onAddCard={addCard}
        onSwitchToMasterView={() => setViewMode('master')}
      />
    );
  }

  // Master View - Full desktop view
  return (
    <div className="relative h-screen">
      <GameBoard
        players={players}
        cards={cards}
        processObjects={processObjects}
        currentPlayerIndex={0}
        currentRound={1}
        maxRounds={999}
        onAddCard={addCard}
        onUpdateCard={updateCard}
        onRemoveCard={removeCard}
        onEndTurn={() => {}}
        onRestart={() => setGameId(null)}
        isGameFinished={false}
        isGameStarted={true}
        onAddPlayer={addPlayer}
        onRemovePlayer={removePlayer}
        onUpdatePlayerPosition={updatePlayerPosition}
        onAddProcessObject={addProcessObject}
        onRemoveProcessObject={removeProcessObject}
        onUpdateProcessObject={updateProcessObject}
        gameId={gameId}
      />
    </div>
  );
};

export default App;
