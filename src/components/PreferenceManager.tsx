import React, { useState } from 'react';
import { AppSettings, Preference } from '../types.ts';
import { saveSettings } from '../utils/storage.ts';
import { ListFilter, X, Check, Plus, Edit, Trash2 } from 'lucide-react';

interface Props {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

const PreferenceManager: React.FC<Props> = ({ settings, setSettings, onClose }) => {
  const [currentPreferences, setCurrentPreferences] = useState<Preference[]>(settings.answerPreferences);
  const [newPreferenceText, setNewPreferenceText] = useState<string>('');
  const [editingPreferenceId, setEditingPreferenceId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');

  const handleSave = () => {
    const newSettings = { ...settings, answerPreferences: currentPreferences };
    setSettings(newSettings);
    saveSettings(newSettings);
    alert('Préférences IA mises à jour !');
    onClose();
  };

  const handleAddPreference = () => {
    if (newPreferenceText.trim() === '') return;
    const newId = Date.now().toString(); // Simple unique ID
    setCurrentPreferences([...currentPreferences, { id: newId, text: newPreferenceText.trim() }]);
    setNewPreferenceText('');
  };

  const handleDeletePreference = (id: string) => {
    setCurrentPreferences(currentPreferences.filter(pref => pref.id !== id));
  };

  const handleStartEdit = (preference: Preference) => {
    setEditingPreferenceId(preference.id);
    setEditingText(preference.text);
  };

  const handleSaveEdit = (id: string) => {
    setCurrentPreferences(currentPreferences.map(pref =>
      pref.id === id ? { ...pref, text: editingText.trim() } : pref
    ));
    setEditingPreferenceId(null);
    setEditingText('');
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-color)] overflow-y-auto p-6 animate-in fade-in duration-500 text-[var(--text-color)]">
      <div className="flex items-center justify-between mb-10 sticky top-0 py-4 z-20 bg-[var(--bg-color)]">
        <button onClick={onClose} className="flex items-center gap-2 opacity-50 hover:opacity-100 uppercase font-black text-xs">
          <X size={20} /> Fermer
        </button>
        <h2 className="text-2xl font-black uppercase flex items-center gap-3">
          <ListFilter className="text-[var(--btn-color)]" /> Gérer les Préférences IA
        </h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <p className="opacity-70">Modifiez et enregistrez vos préférences pour l'IA. Ces instructions guideront l'IA dans toutes ses réponses.</p>

        {/* Add New Preference */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newPreferenceText}
            onChange={(e) => setNewPreferenceText(e.target.value)}
            placeholder="Ajouter une nouvelle préférence (ex: Sois toujours encourageant)"
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 outline-none focus:border-[var(--btn-color)] transition-all text-sm placeholder-[var(--text-color)]/70"
          />
          <button
            onClick={handleAddPreference}
            style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
            className="p-4 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Plus size={20} /> Ajouter
          </button>
        </div>

        {/* List of Current Preferences */}
        <div className="space-y-3">
          {currentPreferences.length === 0 ? (
            <p className="opacity-50 text-center">Aucune préférence enregistrée.</p>
          ) : (
            currentPreferences.map((pref) => (
              <div key={pref.id} className="bg-black/40 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                {editingPreferenceId === pref.id ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    className="flex-1 bg-transparent outline-none border-b border-[var(--btn-color)] text-sm"
                  />
                ) : (
                  <p className="flex-1 text-sm">{pref.text}</p>
                )}
                
                {editingPreferenceId === pref.id ? (
                  <button
                    onClick={() => handleSaveEdit(pref.id)}
                    style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
                    className="p-2 rounded-lg active:scale-95 transition-all"
                  >
                    <Check size={18} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartEdit(pref)}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
                  >
                    <Edit size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleDeletePreference(pref.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={handleSave}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
          className="w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg"
        >
          <Check size={24} /> Enregistrer toutes les Préférences
        </button>
      </div>
    </div>
  );
};

export default PreferenceManager;
