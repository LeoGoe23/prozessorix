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

  const handleSave = async () => {
    if (!newText.trim()) return;

    setLoading(true);
    try {
      await gameService.saveSharedText(newText.trim());
      setNewText('');
    } catch (error) {
      console.error('Error saving text:', error);
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