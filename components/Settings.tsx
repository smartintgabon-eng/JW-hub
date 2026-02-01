
import React from 'react';
import { Settings as SettingsIcon, Palette, Info, Check, MousePointer2 } from 'lucide-react';
import { AppSettings } from '../types';
import { saveSettings } from '../utils/storage';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Settings: React.FC<Props> = ({ settings, setSettings }) => {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    if (key === 'backgroundColor') newSettings.customHex = '';
    if (key === 'buttonColor') newSettings.customButtonHex = '';
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const bgOptions = [
    { name: 'Nuit', value: '#09090b' },
    { name: 'Ardoise', value: '#1e293b' },
    { name: 'JW Bleu', value: '#1a3a5f' },
    { name: 'Lumière', value: '#f4f4f5' },
    { name: 'Sable', value: '#fef3c7' },
  ];

  const btnOptions = [
    { name: 'Bleu', value: '#4a70b5' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Émeraude', value: '#10b981' },
    { name: 'Rose', value: '#ec4899' },
    { name: 'Ambre', value: '#f59e0b' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-[1.5rem] shadow-xl">
          <SettingsIcon size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black">Paramètres</h2>
          <p className="opacity-60 font-medium">Personnalisez votre assistant d'étude.</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 opacity-80">
          <Palette size={20} />
          <h3 className="font-black uppercase tracking-widest text-sm">Couleur du fond</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-10 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {bgOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSetting('backgroundColor', opt.value)}
                className={`relative flex flex-col items-center space-y-3 p-4 rounded-3xl border-2 transition-all ${
                  (settings.backgroundColor === opt.value && !settings.customHex) ? 'border-white scale-105' : 'border-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-full border border-white/20" style={{ backgroundColor: opt.value }} />
                <span className="text-[10px] uppercase font-black opacity-60">{opt.name}</span>
              </button>
            ))}
          </div>
          <div className="space-y-4 pt-8 border-t border-white/5">
            <label className="text-xs font-black uppercase tracking-widest ml-2">Code Hexadécimal du fond</label>
            <div className="flex items-center space-x-4">
               <input
                type="text"
                value={settings.customHex}
                onChange={(e) => updateSetting('customHex', e.target.value)}
                placeholder="#000000"
                className="flex-1 bg-black/20 border-2 border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-white/40 transition-all font-mono text-xl"
              />
              <div className="w-14 h-14 rounded-2xl border-2 border-white/20" style={{ backgroundColor: settings.customHex || settings.backgroundColor }} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 opacity-80">
          <MousePointer2 size={20} />
          <h3 className="font-black uppercase tracking-widest text-sm">Thème des boutons</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-10 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {btnOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSetting('buttonColor', opt.value)}
                className={`relative flex flex-col items-center space-y-3 p-4 rounded-3xl border-2 transition-all ${
                  (settings.buttonColor === opt.value && !settings.customButtonHex) ? 'border-white scale-105' : 'border-white/10'
                }`}
              >
                <div className="w-10 h-10 rounded-full border border-white/20" style={{ backgroundColor: opt.value }} />
                <span className="text-[10px] uppercase font-black opacity-60">{opt.name}</span>
              </button>
            ))}
          </div>
          <div className="space-y-4 pt-8 border-t border-white/5">
            <label className="text-xs font-black uppercase tracking-widest ml-2">Code Hexadécimal des boutons ICI</label>
            <div className="flex items-center space-x-4">
               <input
                type="text"
                value={settings.customButtonHex}
                onChange={(e) => updateSetting('customButtonHex', e.target.value)}
                placeholder="#4A70B5"
                className="flex-1 bg-black/20 border-2 border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-white/40 transition-all font-mono text-xl"
              />
              <div className="w-14 h-14 rounded-2xl border-2 border-white/20" style={{ backgroundColor: settings.customButtonHex || settings.buttonColor }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
