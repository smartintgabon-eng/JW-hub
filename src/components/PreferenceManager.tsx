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
    setSettings({
      ...settings,
      answerPreferences: [...(settings.answerPreferences || []), newPreference]
    });
    setNewPref('');
  };

  const removePreference = (id: string) => {
    setSettings({
      ...settings,
      answerPreferences: (settings.answerPreferences || []).filter(p => p.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Préférences de réponse</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-white/60">
            Ajoutez des instructions spécifiques pour l'IA (ex: "Réponses courtes", "Ton encourageant", "Inclure plus de versets").
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPref}
              onChange={(e) => setNewPref(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPreference()}
              placeholder="Nouvelle préférence..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--btn-color)]"
            />
            <button
              onClick={addPreference}
              disabled={!newPref.trim()}
              className="bg-[var(--btn-color)] text-[var(--btn-text)] p-2 rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              <Plus size={24} />
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {(settings.answerPreferences || []).length === 0 ? (
              <p className="text-center text-white/30 italic py-4">Aucune préférence définie</p>
            ) : (
              (settings.answerPreferences || []).map((pref) => (
                <div key={pref.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg group">
                  <span className="text-white/90 text-sm">{pref.text}</span>
                  <button
                    onClick={() => removePreference(pref.id)}
                    className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 p-1 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-4 bg-white/5 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[var(--btn-color)] text-[var(--btn-text)] px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Check size={18} /> Terminé
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferenceManager;