
import React from 'react';
import { Settings as SettingsIcon, Palette, Smartphone, Info, ShieldCheck } from 'lucide-react';
import { AppSettings } from '../types';
import { saveSettings } from '../utils/storage';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Settings: React.FC<Props> = ({ settings, setSettings }) => {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const bgOptions = [
    { name: 'Nuit profonde', value: '#09090b' },
    { name: 'Minuit', value: '#111111' },
    { name: 'Ardoise', value: '#1e293b' },
    { name: 'Marine', value: '#0f172a' },
    { name: 'JW Bleu', value: '#1a3a5f' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-blue-400">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Paramètres</h2>
          <p className="text-zinc-500 text-sm">Personnalisez votre expérience d'étude.</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 text-zinc-300">
          <Palette size={20} className="text-blue-500" />
          <h3 className="font-bold">Apparence</h3>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-medium text-zinc-400">Couleur de fond prédéfinie</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {bgOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateSetting('backgroundColor', opt.value);
                    updateSetting('customHex', '');
                  }}
                  className={`flex flex-col items-center space-y-2 p-3 rounded-2xl border-2 transition-all ${
                    settings.backgroundColor === opt.value && !settings.customHex 
                      ? 'border-blue-500 bg-blue-500/10 scale-105' 
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full shadow-inner" style={{ backgroundColor: opt.value }} />
                  <span className="text-[10px] uppercase font-bold text-zinc-400">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400">Code Couleur Hexadécimal (Exemple: #1A2B3C)</label>
            <input
              type="text"
              value={settings.customHex}
              onChange={(e) => updateSetting('customHex', e.target.value)}
              placeholder="#000000"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-center font-mono"
            />
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 text-zinc-300">
          <Smartphone size={20} className="text-green-500" />
          <h3 className="font-bold">Application</h3>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium text-zinc-200">Sauvegarde automatique</p>
              <p className="text-xs text-zinc-500">Enregistrer les réponses dans l'historique automatiquement.</p>
            </div>
            <button 
              onClick={() => updateSetting('autoSave', !settings.autoSave)}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoSave ? 'bg-blue-600' : 'bg-zinc-700'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoSave ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-zinc-500 text-sm">
             <div className="flex items-center space-x-2">
                <ShieldCheck size={16} />
                <span>Utilisation du cache local uniquement</span>
             </div>
             <span>Version 2.0.1</span>
          </div>
        </div>
      </section>

      <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-start space-x-3">
         <Info size={18} className="text-blue-400 shrink-0 mt-0.5" />
         <p className="text-xs text-blue-300 leading-relaxed italic">
           Note : Cette application n'est pas affiliée officiellement à JW.org ou Watch Tower Bible and Tract Society. 
           Elle utilise les données publiques pour aider à la préparation personnelle.
         </p>
      </div>
    </div>
  );
};

export default Settings;
