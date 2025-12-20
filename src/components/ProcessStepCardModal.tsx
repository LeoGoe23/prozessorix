import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface ProcessStepCardModalProps {
  onClose: () => void;
  onSubmit: (stepData: {
    name: string;
    input: string;
    output: string;
    systems: string;
    workSteps: string;
    escalationLevel: string;
    duration: string;
    notes: string;
  }) => void;
}

const ProcessStepCardModal: React.FC<ProcessStepCardModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [systems, setSystems] = useState('');
  const [workSteps, setWorkSteps] = useState('');
  const [escalationLevel, setEscalationLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({
        name: name.trim(),
        input: input.trim(),
        output: output.trim(),
        systems: systems.trim(),
        workSteps: workSteps.trim(),
        escalationLevel: escalationLevel.trim(),
        duration: duration.trim(),
        notes: notes.trim(),
      });
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" 
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Prozessschrittkarte erstellen</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Card Preview */}
            <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-xl p-6 shadow-lg h-fit">
              <div className="text-white space-y-3">
                <h3 className="text-lg font-semibold mb-4">Prozessschrittkarte</h3>
                
                <div>
                  <div className="text-xs opacity-70 mb-1">Prozessschrittname:</div>
                  <div className="font-semibold text-lg border-b border-white/30 pb-1">
                    {name || 'z.B. Angebotseinholung'}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="opacity-70">Input:</span> {input || '-'}
                  </div>
                  <div>
                    <span className="opacity-70">Output:</span> {output || '-'}
                  </div>
                  <div>
                    <span className="opacity-70">Systeme:</span> {systems || '-'}
                  </div>
                  <div>
                    <span className="opacity-70">Arbeitsschritte:</span> {workSteps || '-'}
                  </div>
                  <div>
                    <span className="opacity-70">Eskalationsstufe:</span> {escalationLevel || '-'}
                  </div>
                  <div>
                    <span className="opacity-70">Dauer:</span> {duration || '-'}
                  </div>
                  {notes && (
                    <div className="pt-2 border-t border-white/30">
                      <span className="opacity-70">Bemerkung:</span> {notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="space-y-4">
              {/* Prozessschrittname */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prozessschrittname *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="z.B. Angebotseinholung"
                  required
                  autoFocus
                />
              </div>

              {/* Input */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Input
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="Was kommt rein?"
                />
              </div>

              {/* Output */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Output
                </label>
                <input
                  type="text"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="Was kommt raus?"
                />
              </div>

              {/* Systeme */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Systeme
                </label>
                <input
                  type="text"
                  value={systems}
                  onChange={(e) => setSystems(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="Welche Systeme werden verwendet?"
                />
              </div>

              {/* Arbeitsschritte */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Arbeitsschritte
                </label>
                <textarea
                  value={workSteps}
                  onChange={(e) => setWorkSteps(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors resize-none"
                  placeholder="Welche Arbeitsschritte?"
                  rows={3}
                />
              </div>

              {/* Eskalationsstufe */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Eskalationsstufe
                </label>
                <input
                  type="text"
                  value={escalationLevel}
                  onChange={(e) => setEscalationLevel(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="z.B. Niedrig, Mittel, Hoch"
                />
              </div>

              {/* Dauer */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Dauer
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors"
                  placeholder="z.B. 30 Minuten"
                />
              </div>

              {/* Bemerkung */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bemerkung
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition-colors resize-none"
                  placeholder="Weitere Hinweise..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-lg font-semibold transition-all hover:scale-105"
            >
              Prozessschritt erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default ProcessStepCardModal;
