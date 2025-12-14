import React, { useState } from 'react';
import { Play, Users, ArrowRight } from 'lucide-react';
import { createGame, generateGameId } from '../firebase/gameService';

interface GameStartProps {
  onJoinGame: (gameId: string) => void;
}

const GameStart: React.FC<GameStartProps> = ({ onJoinGame }) => {
  const [gameId, setGameId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateGame = async () => {
    setIsCreating(true);
    try {
      const newGameId = generateGameId();
      await createGame(newGameId);
      onJoinGame(newGameId);
    } catch (error) {
      console.error('Error creating game:', error);
      alert('Fehler beim Erstellen des Spiels');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGame = () => {
    if (gameId.trim().length >= 6) {
      onJoinGame(gameId.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center p-6">
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 w-full max-w-md">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Processorix</h1>
            <p className="text-sm text-indigo-300">Kollaboratives Prozess-Mapping</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Create New Game */}
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="flex items-center gap-3">
              <Play className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Neues Spiel erstellen</div>
                <div className="text-xs text-indigo-200">Als Gastgeber starten</div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/50 text-gray-400">oder</span>
            </div>
          </div>

          {/* Join Existing Game */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              Spiel-Code eingeben
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="z.B. ABC123"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
                maxLength={6}
                className="flex-1 px-4 py-3 bg-slate-700/50 border-2 border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white placeholder-gray-500 uppercase text-center text-lg font-mono tracking-wider"
              />
              <button
                onClick={handleJoinGame}
                disabled={gameId.trim().length < 6}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Gib den 6-stelligen Code ein, um einem Spiel beizutreten
            </p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <p className="text-sm text-indigo-200">
            <strong>Hinweis:</strong> Alle Teilnehmer können gleichzeitig am selben Prozess arbeiten.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameStart;
