import React, { useState } from 'react';
import { AppSettings, Preference } from '../types';
import { X, Check, Trash2, Plus } from 'lucide-react';

interface PreferenceManagerProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

const PreferenceManager: React.FC<PreferenceManagerProps> = ({ settings, setSettings, onClose }) => {
  const [newPref, setNewPref] = useState('');

  const addPreference = () => {
    if (!newPref.trim()) return;
    const newPreference: Preference = {
      id: Date.now().toString(),
      text: newPref.trim()
    };
    // Ensure answerPreferences is an array
    const currentPreferences = Array.isArray(settings.answerPreferences) ? settings.answerPreferences : [];
    
    setSettings({
      ...settings,
      answerPreferences: [...currentPreferences, newPreference]
    });
    setNewPref('');
  };

  const removePreference = (id: string) => {
    const currentPreferences = Array.isArray(settings.answerPreferences) ? settings.answerPreferences : [];
    setSettings({
      ...settings,
      answerPreferences: currentPreferences.filter(p => p.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-black/20">
          <h3 className="text-xl font-black uppercase tracking-tight text-white">Préférences IA</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-zinc-400 leading-relaxed">
            Ajoutez des instructions spécifiques pour personnaliser les réponses de l'IA (ex: "Réponses courtes", "Ton encourageant", "Inclure plus de versets").
          </p>

          <div className="flex gap-3">
            <input
              type="text"
              value={newPref}
              onChange={(e) => setNewPref(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPreference()}
              placeholder="Nouvelle instruction..."
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-blue-600 outline-none transition-colors text-sm"
            />
            <button
              onClick={addPreference}
              disabled={!newPref.trim()}
              className="bg-blue-600 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {(!settings.answerPreferences || settings.answerPreferences.length === 0) ? (
              <div className="text-center py-8 border-2 border-dashed border-zinc-800 rounded-xl">
                <p className="text-zinc-600 text-sm font-medium">Aucune préférence définie</p>
              </div>
            ) : (
              settings.answerPreferences.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between bg-black/40 border border-zinc-800 p-3 rounded-xl group hover:border-zinc-700 transition-colors">
                  <span className="text-zinc-300 text-sm font-medium">{pref.text}</span>
                  <button
                    onClick={() => removePreference(pref.id)}
                    className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-black/20 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-zinc-700 transition-colors flex items-center gap-2"
          >
            <Check size={16} /> Terminé
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceManager;