import React from 'react';
import ReactDOM from 'react-dom';
import { X, GitMerge, GitBranch } from 'lucide-react';

interface ProcessConnectorModalProps {
  onClose: () => void;
  onSelectProcessStep: () => void;
  onSelectDecision: () => void;
}

const ProcessConnectorModal: React.FC<ProcessConnectorModalProps> = ({
  onClose,
  onSelectProcessStep,
  onSelectDecision,
}) => {
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 border-purple-400/30 p-8 w-[500px] max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <GitMerge className="w-6 h-6 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Prozessschrittverbinder</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-6">
          Wählen Sie aus, welche Art von Verbindung Sie erstellen möchten:
        </p>

        {/* Options */}
        <div className="space-y-4">
          {/* Prozessschritt Option */}
          <button
            onClick={() => {
              onSelectProcessStep();
              onClose();
            }}
            className="w-full bg-gradient-to-br from-teal-500/20 to-teal-600/20 hover:from-teal-500/30 hover:to-teal-600/30 border-2 border-teal-400/50 rounded-xl p-6 transition-all group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <GitMerge className="w-6 h-6 text-teal-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Prozessschritt</h3>
                <p className="text-sm text-gray-300">
                  Verbinden Sie zwei Spieler oder Prozessschritte mit einer Prozesslinie.
                  Zeigt den Fluss von einem Schritt zum nächsten.
                </p>
              </div>
            </div>
          </button>

          {/* Entscheidung Option */}
          <button
            onClick={() => {
              onSelectDecision();
              onClose();
            }}
            className="w-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 hover:from-purple-500/30 hover:to-purple-600/30 border-2 border-purple-400/50 rounded-xl p-6 transition-all group text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <GitBranch className="w-6 h-6 text-purple-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">Entscheidung</h3>
                <p className="text-sm text-gray-300">
                  Erstellen Sie einen Entscheidungspunkt mit mehreren möglichen Wegen.
                  Ideal für Verzweigungen im Prozess.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700/70 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ProcessConnectorModal;
