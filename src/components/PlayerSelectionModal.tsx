import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { PLAYER_ICONS } from '../types/game';
import IconPicker from './IconPicker';

interface PlayerSelectionModalProps {
  onClose: () => void;
  onSubmit: (playerData: {
    name: string;
    role: string;
    department: string;
    icon: string;
  }) => void;
}

const PlayerSelectionModal: React.FC<PlayerSelectionModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [icon, setIcon] = useState(PLAYER_ICONS[0]);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && role.trim()) {
      onSubmit({
        name: name.trim(),
        role: role.trim(),
        department: department.trim(),
        icon
      });
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Spielerkarte erstellen</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Card Preview */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 shadow-lg">
              <div className="text-white">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-4">Spielerkarte</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs opacity-70 mb-1">Name:</div>
                        <div className="font-semibold">{name || 'Dein Name'}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs opacity-70 mb-1">Rolle:</div>
                        <div className="font-semibold">{role || 'Deine Rolle'}</div>
                      </div>
                      
                      <div>
                        <div className="text-xs opacity-70 mb-1">Abteilung:</div>
                        <div className="font-semibold">{department || 'Deine Abteilung'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 ml-4">
                    <div className="text-4xl">{icon}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="z.B. Johann Götz"
                  required
                />
              </div>

              {/* Rolle */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Rolle *
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="z.B. Controller"
                  required
                />
              </div>

              {/* Abteilung */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Abteilung
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="z.B. ITP"
                />
              </div>

              {/* Icon Picker */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Icon
                </label>
                {showIconPicker ? (
                  <div className="bg-slate-700/30 rounded-lg p-4 border border-white/10">
                    <IconPicker
                      selectedIcon={icon}
                      onSelectIcon={(selectedIcon) => {
                        setIcon(selectedIcon);
                        setShowIconPicker(false);
                      }}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowIconPicker(true)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-white/10 rounded-lg text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <span className="text-2xl">{icon}</span>
                    <span className="text-sm">Icon ändern</span>
                  </button>
                )}
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-semibold transition-all hover:scale-105"
            >
              Spieler erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default PlayerSelectionModal;
