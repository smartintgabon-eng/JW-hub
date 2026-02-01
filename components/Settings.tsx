
import React from 'react';
import { Settings as SettingsIcon, Palette, Info, Check } from 'lucide-react';
import { AppSettings } from '../types';
import { saveSettings } from '../utils/storage';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Settings: React.FC<Props> = ({ settings, setSettings }) => {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    // Si on change la couleur prédéfinie, on vide le hex personnalisé pour que ça s'applique
    if (key === 'backgroundColor') {
      newSettings.customHex = '';
    }
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const bgOptions = [
    { name: 'Nuit', value: '#09090b' },
    { name: 'Ardoise', value: '#1e293b' },
    { name: 'JW Bleu', value: '#1a3a5f' },
    { name: 'Émeraude', value: '#064e3b' },
    { name: 'Pourpre', value: '#2e1065' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] text-blue-400 shadow-xl">
          <SettingsIcon size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">Paramètres</h2>
          <p className="text-zinc-500 font-medium">Personnalisez votre assistant d'étude.</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 text-zinc-300">
          <Palette size={20} className="text-blue-500" />
          <h3 className="font-black uppercase tracking-widest text-sm">Apparence du fond</h3>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-10 shadow-2xl">
          
          <div className="space-y-6">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-2">1. Choisissez une couleur</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {bgOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateSetting('backgroundColor', opt.value)}
                  className={`relative flex flex-col items-center space-y-3 p-4 rounded-3xl border-2 transition-all duration-300 ${
                    settings.backgroundColor === opt.value && !settings.customHex 
                      ? 'border-blue-500 bg-blue-500/20 scale-105 shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                      : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full shadow-2xl border border-white/10" style={{ backgroundColor: opt.value }} />
                  <span className="text-[10px] uppercase font-black text-zinc-400">{opt.name}</span>
                  {settings.backgroundColor === opt.value && !settings.customHex && (
                    <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-0.5">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-zinc-800/50">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-2">2. OU INSÉREZ VOTRE CODE ICI (HEXADÉCIMAL)</label>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight ml-2">Exemple: #4A70B5 ou #000000</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  value={settings.customHex}
                  onChange={(e) => updateSetting('customHex', e.target.value)}
                  placeholder="#4A70B5"
                  className="w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl py-5 px-6 focus:outline-none focus:border-blue-500/60 transition-all text-white font-mono text-xl shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded">Tapez ici</span>
                </div>
              </div>
              <div 
                className="w-16 h-16 rounded-2xl border-4 border-zinc-800 shadow-2xl transition-all duration-500" 
                style={{ backgroundColor: settings.customHex || settings.backgroundColor }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-[2.5rem] flex items-start space-x-5 shadow-xl">
         <div className="p-3 bg-blue-500/20 rounded-2xl">
           <Info size={28} className="text-blue-400 shrink-0" />
         </div>
         <div className="space-y-2">
           <p className="font-black text-blue-400 uppercase tracking-widest text-xs">Conseil d'utilisation</p>
           <p className="text-sm text-blue-200/80 leading-relaxed font-medium">
             Les couleurs sombres (Ardoise, Nuit) sont recommandées pour limiter la fatigue visuelle lors des réunions. Vos réglages sont automatiquement sauvegardés sur cet appareil.
           </p>
         </div>
      </div>
    </div>
  );
};

export default Settings;
