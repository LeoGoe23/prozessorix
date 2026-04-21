import React, { useState, useEffect } from 'react';
import { SharedText } from '../types/game';
import * as gameService from '../firebase/gameService';

const TextSharingPage: React.FC = () => {
  const [texts, setTexts] = useState<SharedText[]>([]);
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe to shared texts
    const unsubscribe = gameService.subscribeToSharedTexts((updatedTexts) => {
      setTexts(updatedTexts);
    });

    return unsubscribe;
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const log = (msg: string) => {
    console.log('[TextSharing]', msg);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  };

  const handleSave = async () => {
    setError(null);
    if (!newText.trim()) {
      log('Abbruch: Text leer');
      return;
    }

    log(`Speichere Text: "${newText.trim().substring(0, 30)}..."`);
    setLoading(true);
    try {
      const id = await gameService.saveSharedText(newText.trim());
      log(`Gespeichert mit ID: ${id}`);
      setNewText('');
    } catch (err: any) {
      const msg = err?.message || String(err);
      log(`FEHLER: ${msg}`);
      setError(msg);
      console.error('Error saving text:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await gameService.deleteSharedText(id);
    } catch (error) {
      console.error('Error deleting text:', error);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('Text kopiert!');
    } catch (error) {
      console.error('Fehler beim Kopieren:', error);
      // Fallback für ältere Browser
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Text kopiert!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Text Sharing</h1>

        {/* Add new text */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Neuen Text hinzufügen</h2>
          <div className="space-y-4">
            <textarea
              placeholder="Text eingeben..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded h-32"
            />
            <button
              onClick={handleSave}
              disabled={loading || !newText.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Speichere...' : 'Speichern'}
            </button>
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                <strong>Fehler:</strong> {error}
              </div>
            )}
            {debugLog.length > 0 && (
              <div className="p-3 bg-gray-800 text-green-400 rounded text-xs font-mono max-h-32 overflow-y-auto">
                {debugLog.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            )}
          </div>
        </div>

        {/* List of texts */}
        <div className="space-y-4">
          {texts.map((text) => (
            <div key={text.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-800 whitespace-pre-wrap">{text.content}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    {text.createdAt.toLocaleString()}
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleCopy(text.content)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Kopieren
                  </button>
                  <button
                    onClick={() => handleDelete(text.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
          {texts.length === 0 && (
            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
              Noch keine Texte vorhanden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextSharingPage;