import React, { useState } from 'react';
import { AppSettings, Preference } from '../types';
import { Check, Trash2, Plus, Palette, Globe, Sliders } from 'lucide-react';

interface PreferenceManagerProps {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
}

const PreferenceManager: React.FC<PreferenceManagerProps> = ({ settings, setSettings }) => {
  const [newPref, setNewPref] = useState('');
  const [btnColorInput, setBtnColorInput] = useState(settings.btnColor);
  const [bgColorInput, setBgColorInput] = useState(settings.bgColor);

  const addPreference = () => {
    if (!newPref.trim()) return;
    const newPreference: Preference = {
      id: Date.now().toString(),
      text: newPref.trim()
    };
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

  const handleSaveStyle = () => {
    setSettings({
      ...settings,
      btnColor: btnColorInput,
      bgColor: bgColorInput
    });
  };

  const colorPresets = [
    { name: 'Bleu JW', hex: '#4a6da7' },
    { name: 'Indigo', hex: '#4f46e5' },
    { name: 'Émeraude', hex: '#10b981' },
    { name: 'Ambre', hex: '#f59e0b' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-center mb-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#111] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10" style={{ color: settings.btnColor }}>
            <Sliders size={32} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Paramètres</h2>
          <p className="text-gray-400 italic mt-2">Personnalisez votre expérience.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Style & Langue */}
        <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-xl">
          <h3 className="text-sm font-black uppercase text-gray-400 mb-6 flex items-center gap-2 tracking-wider">
            <Palette size={16} /> Style & Langue
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-gray-400" />
                <span className="font-medium text-gray-200">Langue du site & IA</span>
              </div>
              <select 
                value={settings.language}
                onChange={(e) => setSettings({...settings, language: e.target.value as any})}
                className="bg-transparent text-white outline-none font-bold cursor-pointer"
              >
                <option value="fr" className="bg-[#111]">Français</option>
                <option value="en" className="bg-[#111]">English</option>
                <option value="es" className="bg-[#111]">Español</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider block mb-2">Couleur des boutons</label>
              <div className="flex gap-3 mb-3">
                <input 
                  type="text" 
                  value={btnColorInput}
                  onChange={(e) => setBtnColorInput(e.target.value)}
                  placeholder="Décrivez une couleur ou entrez un hex (ex: 'bleu océan' ou #123456)"
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-white/30 outline-none transition-colors"
                />
                <div className="w-12 h-12 rounded-xl border border-white/20 shrink-0" style={{ backgroundColor: btnColorInput }}></div>
              </div>
              <div className="flex flex-wrap gap-2">
                {colorPresets.map(preset => (
                  <button 
                    key={preset.name}
                    onClick={() => setBtnColorInput(preset.hex)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 hover:bg-white/5 transition-colors flex items-center gap-2 text-gray-300"
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.hex }}></div>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider block mb-2">Couleur de fond</label>
              <div className="flex gap-3 mb-3">
                <input 
                  type="text" 
                  value={bgColorInput}
                  onChange={(e) => setBgColorInput(e.target.value)}
                  placeholder="Décrivez une couleur ou entrez un hex (ex: 'vert forêt' ou #654321)"
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-white/30 outline-none transition-colors"
                />
                <div className="w-12 h-12 rounded-xl border border-white/20 shrink-0" style={{ backgroundColor: bgColorInput }}></div>
              </div>
            </div>

            <button 
              onClick={handleSaveStyle}
              className="w-full py-4 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-widest rounded-xl transition-all"
            >
              Sauvegarder le style
            </button>
          </div>
        </div>

        {/* Préférences IA */}
        <div className="bg-[#111] border border-white/10 rounded-[2rem] p-8 shadow-xl">
          <h3 className="text-sm font-black uppercase text-gray-400 mb-6 flex items-center gap-2 tracking-wider">
            <Check size={16} /> Préférences IA
          </h3>
          
          <p className="text-sm text-gray-500 mb-6">
            Ajoutez des instructions spécifiques pour personnaliser les réponses de l'IA (ex: "Réponses courtes", "Ton encourageant", "Inclure plus de versets").
          </p>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={newPref}
              onChange={(e) => setNewPref(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPreference()}
              placeholder="Nouvelle instruction..."
              className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-white/30 outline-none transition-colors"
            />
            <button
              onClick={addPreference}
              disabled={!newPref.trim()}
              style={{ backgroundColor: settings.btnColor }}
              className="text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-colors shadow-md"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="space-y-2">
            {(!settings.answerPreferences || settings.answerPreferences.length === 0) ? (
              <div className="text-center py-8 border-2 border-dashed border-white/5 rounded-xl">
                <p className="text-gray-600 text-sm font-medium">Aucune préférence définie</p>
              </div>
            ) : (
              settings.answerPreferences.map((pref) => (
                <div key={pref.id} className="flex items-center justify-between bg-black/30 border border-white/5 p-4 rounded-xl group hover:border-white/10 transition-colors">
                  <span className="text-gray-300 text-sm font-medium">{pref.text}</span>
                  <button
                    onClick={() => removePreference(pref.id)}
                    className="text-gray-500 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferenceManager;