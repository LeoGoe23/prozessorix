import React, { useState } from 'react';
import { Player } from '../types/game';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

interface ProcessStepCreatorProps {
  players: Player[];
  onCreateStep: (
    text: string,
    fromPlayerId: string,
    toPlayerId: string,
    medium?: string,
    duration?: string,
    description?: string
  ) => void;
  onCancel: () => void;
}

type Step = 'sender' | 'receiver' | 'details';

const ProcessStepCreator: React.FC<ProcessStepCreatorProps> = ({
  players,
  onCreateStep,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('sender');
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [selectedReceiver, setSelectedReceiver] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [medium, setMedium] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');

  const handleNext = () => {
    if (currentStep === 'sender' && selectedSender) {
      setCurrentStep('receiver');
    } else if (currentStep === 'receiver' && selectedReceiver) {
      setCurrentStep('details');
    }
  };

  const handleBack = () => {
    if (currentStep === 'receiver') {
      setCurrentStep('sender');
    } else if (currentStep === 'details') {
      setCurrentStep('receiver');
    }
  };

  const handleCreate = () => {
    if (selectedSender && selectedReceiver && title.trim()) {
      onCreateStep(
        title.trim(),
        selectedSender,
        selectedReceiver,
        medium.trim() || undefined,
        duration.trim() || undefined,
        description.trim() || undefined
      );
    }
  };

  const canProceed = () => {
    if (currentStep === 'sender') return selectedSender !== null;
    if (currentStep === 'receiver') return selectedReceiver !== null;
    if (currentStep === 'details') return title.trim().length > 0;
    return false;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Progress Indicator */}
      <div className="mb-4 flex items-center gap-2">
        <div className={`flex-1 h-1 rounded ${currentStep === 'sender' ? 'bg-purple-500' : 'bg-gray-600'}`} />
        <div className={`flex-1 h-1 rounded ${currentStep === 'receiver' ? 'bg-purple-500' : 'bg-gray-600'}`} />
        <div className={`flex-1 h-1 rounded ${currentStep === 'details' ? 'bg-purple-500' : 'bg-gray-600'}`} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Step 1: Sender Selection */}
        {currentStep === 'sender' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Wer sendet? (Von)</h3>
            <div className="space-y-2">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => setSelectedSender(player.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                    selectedSender === player.id
                      ? 'bg-purple-500/20 border-purple-400'
                      : 'bg-slate-700/50 border-transparent hover:bg-slate-600/50'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: player.color }}
                  >
                    {player.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-white">{player.name}</div>
                    <div className="text-xs text-gray-400">{player.role}</div>
                  </div>
                  {selectedSender === player.id && (
                    <CheckCircle className="w-5 h-5 text-purple-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Receiver Selection */}
        {currentStep === 'receiver' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Wer empfängt? (An)</h3>
            <div className="space-y-2">
              {players
                .filter(p => p.id !== selectedSender)
                .map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedReceiver(player.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      selectedReceiver === player.id
                        ? 'bg-purple-500/20 border-purple-400'
                        : 'bg-slate-700/50 border-transparent hover:bg-slate-600/50'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: player.color }}
                    >
                      {player.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-white">{player.name}</div>
                      <div className="text-xs text-gray-400">{player.role}</div>
                    </div>
                    {selectedReceiver === player.id && (
                      <CheckCircle className="w-5 h-5 text-purple-400" />
                    )}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {currentStep === 'details' && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white mb-3">Details zum Prozessschritt</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Titel / Kurzbeschreibung *
              </label>
              <input
                type="text"
                placeholder="z.B. Anfrage bearbeiten"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm placeholder-gray-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Medium (optional)
              </label>
              <input
                type="text"
                placeholder="z.B. E-Mail, Teams, Telefon"
                value={medium}
                onChange={(e) => setMedium(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Dauer (optional)
              </label>
              <input
                type="text"
                placeholder="z.B. 2 Stunden, 1 Tag"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">
                Beschreibung (optional)
              </label>
              <textarea
                placeholder="Weitere Details zum Prozessschritt..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg focus:border-purple-500 focus:outline-none text-white text-sm placeholder-gray-500 resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="mt-4 flex gap-2">
        {currentStep !== 'sender' && (
          <button
            onClick={handleBack}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-all font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </button>
        )}
        
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 bg-slate-700/50 text-gray-300 rounded-lg hover:bg-slate-600/50 transition-all font-medium"
        >
          Abbrechen
        </button>

        {currentStep !== 'details' ? (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Weiter
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            Erstellen
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessStepCreator;
