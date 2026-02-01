
import React from 'react';
import { Settings as SettingsIcon, Palette, Info, MessageSquareText, MousePointer2 } from 'lucide-react';
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-lg">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Paramètres</h2>
          <p className="opacity-50 text-sm">Personnalisez votre assistant.</p>
        </div>
      </div>

      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <Palette size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Apparence du fond</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {bgOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSetting('backgroundColor', opt.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                (settings.backgroundColor === opt.value && !settings.customHex) ? 'border-[var(--btn-color)] bg-white/5' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="w-full h-8 rounded-lg mb-2" style={{ backgroundColor: opt.value }} />
              <span className="text-[10px] font-bold uppercase block text-center opacity-60">{opt.name}</span>
            </button>
          ))}
        </div>
        <div className="pt-4 border-t border-white/5">
          <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">Code couleur personnalisé</label>
          <input
            type="text"
            value={settings.customHex}
            onChange={(e) => updateSetting('customHex', e.target.value)}
            placeholder="Ex: #09090b"
            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 font-mono text-sm focus:border-[var(--btn-color)] outline-none"
          />
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <MessageSquareText size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Préférences des réponses</h3>
        </div>
        <div className="space-y-4">
          <textarea
            value={settings.answerPreferences}
            onChange={(e) => updateSetting('answerPreferences', e.target.value)}
            placeholder="Ex: Sois bref dans les réponses, utilise un ton simple pour les enfants, ou concentre-toi sur l'application pratique..."
            className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl py-4 px-5 focus:border-[var(--btn-color)] outline-none resize-none text-sm leading-relaxed"
          />
          <div className="flex items-start space-x-2 opacity-40 text-[11px] italic">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span>Ces instructions seront envoyées à l'IA pour chaque génération d'étude.</span>
          </div>
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <MousePointer2 size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Couleur des boutons</h3>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={settings.customButtonHex}
            onChange={(e) => updateSetting('customButtonHex', e.target.value)}
            placeholder="Ex: #4a70b5"
            className="flex-1 bg-black/20 border border-white/10 rounded-xl py-3 px-4 font-mono text-sm focus:border-[var(--btn-color)] outline-none"
          />
          <div className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/10" style={{ backgroundColor: settings.customButtonHex || settings.buttonColor }} />
        </div>
      </section>
    </div>
  );
};

export default Settings;
