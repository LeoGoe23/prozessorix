import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Copy, Check, Share2, Settings } from 'lucide-react';
import { getBaseUrl, getBaseUrlSync, setBaseUrl } from '../firebase/gameService';

interface ShareGameModalProps {
  gameId: string;
  onClose: () => void;
}

const ShareGameModal: React.FC<ShareGameModalProps> = ({ gameId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrlState] = useState(getBaseUrlSync());
  const [showSettings, setShowSettings] = useState(false);
  const [editUrl, setEditUrl] = useState(baseUrl);
  const [isSaving, setIsSaving] = useState(false);

  const playerUrl = `${baseUrl}?game=${gameId}&view=player`;
  const masterUrl = `${baseUrl}?game=${gameId}`;

  // Load base URL from Firebase
  useEffect(() => {
    const loadBaseUrl = async () => {
      const url = await getBaseUrl();
      setBaseUrlState(url);
      setEditUrl(url);
    };
    loadBaseUrl();
  }, []);

  const handleCopyPlayerLink = async () => {
    try {
      await navigator.clipboard.writeText(playerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyMasterLink = async () => {
    try {
      await navigator.clipboard.writeText(masterUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(gameId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSaveBaseUrl = async () => {
    setIsSaving(true);
    try {
      // Validate URL
      new URL(editUrl);
      await setBaseUrl(editUrl);
      setBaseUrlState(editUrl);
      setShowSettings(false);
    } catch (err) {
      alert('Ungültige URL. Bitte gib eine vollständige URL ein (z.B. https://meine-app.netlify.app)');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-end z-[200] p-4">
      {/* Close on backdrop click */}
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Modal from right */}
      <div className="relative bg-slate-800 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md flex flex-col animate-slide-in-right overflow-hidden" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Spiel teilen</h2>
              <p className="text-sm text-gray-400">Lade andere Spieler ein</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="URL-Einstellungen"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-slate-700/50 border-b border-white/10 p-6">
            <h3 className="text-sm font-semibold text-white mb-3">⚙️ Base URL Einstellungen</h3>
            <p className="text-xs text-gray-400 mb-3">
              Setze die Base URL für deine Deployment-Umgebung (z.B. Netlify, Vercel)
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                placeholder="https://meine-app.netlify.app"
                className="flex-1 px-4 py-2 bg-slate-700 border-2 border-white/10 rounded-lg focus:border-indigo-500 focus:outline-none text-white placeholder-gray-500 text-sm"
              />
              <button
                onClick={handleSaveBaseUrl}
                disabled={isSaving || !editUrl.trim()}
                className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isSaving ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
            <p className="text-xs text-green-400 mt-2">
              Aktuell: {baseUrl}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* QR Code for Player View */}
          <div className="bg-white p-4 rounded-xl">
            <QRCodeSVG 
              value={playerUrl} 
              size={200}
              level="H"
              className="w-full h-auto"
            />
          </div>

          {/* Game Code */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400">
              Spiel-Code
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg">
                <div className="text-xl font-bold text-white font-mono tracking-wider text-center">
                  {gameId}
                </div>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Player Link (Mobile) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400">
              📱 Spieler-Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg">
                <div className="text-xs text-gray-300 truncate">
                  {playerUrl}
                </div>
              </div>
              <button
                onClick={handleCopyPlayerLink}
                className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Master Link (Desktop) */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400">
              💻 Master-Link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2 bg-slate-700/50 border border-white/10 rounded-lg">
                <div className="text-xs text-gray-300 truncate">
                  {masterUrl}
                </div>
              </div>
              <button
                onClick={handleCopyMasterLink}
                className="px-3 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareGameModal;
