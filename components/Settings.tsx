
import React from 'react';
import { Settings as SettingsIcon, Palette, Info } from 'lucide-react';
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
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
          <div className="space-y-6">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Couleurs Préfabriquées</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {bgOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    updateSetting('customHex', '');
                    updateSetting('backgroundColor', opt.value);
                  }}
                  className={`flex flex-col items-center space-y-3 p-4 rounded-3xl border-2 transition-all ${
                    settings.backgroundColor === opt.value && !settings.customHex 
                      ? 'border-blue-500 bg-blue-500/10 scale-105' 
                      : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full shadow-2xl border border-white/10" style={{ backgroundColor: opt.value }} />
                  <span className="text-[10px] uppercase font-black text-zinc-400">{opt.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-6 border-t border-zinc-800">
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Code Couleur Personnalisé</label>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-tight">Insérez un code hexadécimal (ex: #4a70b5 ou #000000)</p>
            </div>
            <div className="relative group">
              <input
                type="text"
                value={settings.customHex}
                onChange={(e) => updateSetting('customHex', e.target.value)}
                placeholder="#4A70B5"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-5 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-left font-mono text-xl group-hover:border-zinc-700 transition-all text-white"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg border border-white/10 shadow-lg" style={{ backgroundColor: settings.customHex || (settings.backgroundColor || '#000') }} />
            </div>
          </div>
        </div>
      </section>

      <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-[2rem] flex items-start space-x-4 shadow-xl">
         <Info size={24} className="text-blue-400 shrink-0 mt-1" />
         <p className="text-sm text-blue-300 leading-relaxed font-medium italic">
           Note : Vos choix sont enregistrés localement. Si l'IA est lente, cela peut être dû au quota Google Flash. Patientez 1 min.
         </p>
      </div>
    </div>
  );
};

export default Settings;
