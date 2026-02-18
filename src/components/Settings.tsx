import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Palette, Info, MessageSquareText, 
  MousePointer2, Trash2, RotateCcw, AlertTriangle, CheckCircle, Download, Smartphone, Globe
} from 'lucide-react';
import { AppSettings } from '../types'; 
import { saveSettings, clearHistory, totalReset } from '../utils/storage'; 
import { isEqual } from 'lodash'; 

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  deferredPrompt: any;
  handleInstallClick: () => void;
}

const Settings: React.FC<Props> = ({ settings, setSettings, deferredPrompt, handleInstallClick }) => {
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);
  const [showSavedMessage, setShowSavedMessage] = useState(false);

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  const handleDraftChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newDraft = { ...draftSettings, [key]: value };
    setDraftSettings(newDraft);
  };

  const handleSaveSettings = () => {
    setSettings(draftSettings);
    saveSettings(draftSettings);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const bgOptions = [
    { name: 'Nuit', value: '#09090b' },
    { name: 'Ardoise', value: '#1e293b' },
    { name: 'JW Bleu', value: '#1a3a5f' },
    { name: 'Lumière', value: '#f4f4f5' },
    { name: 'Sable', value: '#fef3c7' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:max-w-5xl md:mx-auto"> 
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-lg">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Paramètres</h2>
          <p className="opacity-50 text-sm">Personnalisez votre expérience.</p>
        </div>
      </div>

      {/* PWA INSTALLATION HELP */}
      <section className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-3 text-blue-400">
          <Download size={24} />
          <h3 className="font-black uppercase text-lg tracking-tight">Installation de l'application</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-sm opacity-70">Pour utiliser JW Study comme une véritable application, même sans internet :</p>
            {deferredPrompt ? (
              <button 
                onClick={handleInstallClick}
                className="w-full py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Download size={18} /> Installer maintenant
              </button>
            ) : (
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-3">
                <p className="font-bold flex items-center gap-2 text-blue-400"><Smartphone size={14}/> Guide Manuel :</p>
                <ul className="space-y-2 opacity-60">
                  <li>• <b>Android :</b> Appuyez sur les 3 points (menu) et "Installer l'application".</li>
                  <li>• <b>iOS (iPhone) :</b> Appuyez sur "Partager" puis "Sur l'écran d'accueil".</li>
                </ul>
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center justify-center opacity-20">
            <Download size={80} />
          </div>
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <Palette size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Apparence du fond</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {bgOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleDraftChange('backgroundColor', opt.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                (draftSettings.backgroundColor === opt.value) ? 'border-[var(--btn-color)] bg-white/5' : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div className="w-full h-8 rounded-lg mb-2" style={{ backgroundColor: opt.value }} />
              <span className="text-[10px] font-bold uppercase block text-center opacity-60">{opt.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <MessageSquareText size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Préférences des réponses</h3>
        </div>
        <textarea
          value={draftSettings.answerPreferences}
          onChange={(e) => handleDraftChange('answerPreferences', e.target.value)}
          placeholder="Ex: Sois bref, utilise un ton simple..."
          className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl py-4 px-5 focus:border-[var(--btn-color)] outline-none resize-none text-sm"
        />
      </section>

      {!isEqual(settings, draftSettings) && (
        <button 
          onClick={handleSaveSettings}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
          className="w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:brightness-110 transition-all flex items-center justify-center space-x-2"
        >
          <CheckCircle size={20} />
          <span>Confirmer les modifications</span>
        </button>
      )}

      {showSavedMessage && (
        <p className="text-center text-emerald-400 font-bold animate-pulse uppercase text-xs">Enregistré avec succès !</p>
      )}

      <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-4">
        <div className="flex items-center space-x-2 text-red-400 opacity-70">
          <AlertTriangle size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Zone de danger</h3>
        </div>
        <button onClick={() => { if(window.confirm("Tout supprimer ?")) clearHistory(); window.location.reload(); }} className="w-full py-4 bg-red-500/10 text-red-400 rounded-xl font-bold text-xs uppercase hover:bg-red-500/20 transition-all">Effacer Historique</button>
      </section>
    </div>
  );
};

export default Settings;