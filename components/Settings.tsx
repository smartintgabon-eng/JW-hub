
import React from 'react';
import { Settings as SettingsIcon, Palette, Info, Check, MousePointer2, MessageSquareText } from 'lucide-react';
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex items-center space-x-6 mb-4">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-5 rounded-[1.75rem] shadow-2xl">
          <SettingsIcon size={36} />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight">Paramètres</h2>
          <p className="opacity-50 font-bold">Configurez votre expérience Pro.</p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 opacity-60 ml-2">
          <Palette size={20} />
          <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Couleur du fond</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {bgOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSetting('backgroundColor', opt.value)}
                className={`relative flex flex-col items-center space-y-3 p-5 rounded-[2rem] border-2 transition-all ${
                  (settings.backgroundColor === opt.value && !settings.customHex) ? 'border-[var(--btn-color)] bg-white/5 scale-105' : 'border-white/5 hover:border-white/20'
                }`}
              >
                <div className="w-12 h-12 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: opt.value }} />
                <span className="text-[9px] uppercase font-black opacity-40">{opt.name}</span>
              </button>
            ))}
          </div>
          <div className="space-y-4 pt-10 border-t border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-2">Code Hexadécimal personnalisé</label>
            <div className="flex items-center space-x-6">
               <input
                type="text"
                value={settings.customHex}
                onChange={(e) => updateSetting('customHex', e.target.value)}
                placeholder="Exemple: #09090b"
                className="flex-1 bg-black/20 border-2 border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-[var(--btn-color)] transition-all font-mono text-xl"
              />
              <div className="w-16 h-16 rounded-2xl border-4 border-white/10 shadow-2xl" style={{ backgroundColor: settings.customHex || settings.backgroundColor }} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 opacity-60 ml-2">
          <MessageSquareText size={20} />
          <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Préférences des réponses</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-2">Directives pour l'IA (Optionnel)</label>
              <textarea
                value={settings.answerPreferences}
                onChange={(e) => updateSetting('answerPreferences', e.target.value)}
                placeholder="Exemple: Utilise un ton plus simple, ou concentre-toi davantage sur l'application familiale..."
                className="w-full h-40 bg-black/20 border-2 border-white/10 rounded-[2rem] py-6 px-8 focus:outline-none focus:border-[var(--btn-color)] transition-all font-medium text-lg resize-none"
              />
              <div className="flex items-center space-x-2 opacity-30 text-[10px] font-bold italic px-4">
                <Info size={14} />
                <span>Ces préférences influenceront la manière dont l'IA prépare vos commentaires.</span>
              </div>
           </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center space-x-3 opacity-60 ml-2">
          <MousePointer2 size={20} />
          <h3 className="font-black uppercase tracking-[0.2em] text-[10px]">Thème des boutons</h3>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10 space-y-10 shadow-2xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {btnOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateSetting('buttonColor', opt.value)}
                className={`relative flex flex-col items-center space-y-3 p-5 rounded-[2rem] border-2 transition-all ${
                  (settings.buttonColor === opt.value && !settings.customButtonHex) ? 'border-white scale-105 shadow-xl' : 'border-white/5'
                }`}
              >
                <div className="w-12 h-12 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: opt.value }} />
                <span className="text-[9px] uppercase font-black opacity-40">{opt.name}</span>
              </button>
            ))}
          </div>
          <div className="space-y-4 pt-10 border-t border-white/5">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ml-2">Code Hexadécimal des boutons</label>
            <div className="flex items-center space-x-6">
               <input
                type="text"
                value={settings.customButtonHex}
                onChange={(e) => updateSetting('customButtonHex', e.target.value)}
                placeholder="Exemple: #4a70b5"
                className="flex-1 bg-black/20 border-2 border-white/10 rounded-2xl py-5 px-8 focus:outline-none focus:border-[var(--btn-color)] transition-all font-mono text-xl"
              />
              <div className="w-16 h-16 rounded-2xl border-4 border-white/10 shadow-2xl" style={{ backgroundColor: settings.customButtonHex || settings.buttonColor }} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
