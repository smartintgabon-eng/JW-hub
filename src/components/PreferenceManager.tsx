import React from 'react';
import { AppSettings } from '../types.ts';
import { getSettings, saveSettings } from '../utils/storage.ts';
import { ListFilter, X } from 'lucide-react';

interface Props {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  onClose: () => void;
}

const PreferenceManager: React.FC<Props> = ({ settings, setSettings, onClose }) => {
  const [currentPreferences, setCurrentPreferences] = React.useState(settings.answerPreferences);

  const handleSave = () => {
    const newSettings = { ...settings, answerPreferences: currentPreferences };
    setSettings(newSettings);
    saveSettings(newSettings);
    alert('Préférences IA mises à jour !');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[var(--bg-color)] overflow-y-auto p-6 animate-in fade-in duration-500">
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
        <textarea
          value={currentPreferences}
          onChange={(e) => setCurrentPreferences(e.target.value)}
          placeholder="Ex: Réponds toujours en français, sois encourageant, cite toujours la TMN..."
          className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)] transition-all resize-none text-sm"
        />
        <button
          onClick={handleSave}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
          className="w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <Check size={24} /> Enregistrer les Préférences
        </button>
      </div>
    </div>
  );
};

export default PreferenceManager;
