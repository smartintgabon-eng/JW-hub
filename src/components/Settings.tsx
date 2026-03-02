import { useState } from 'react';
import { Palette, ListFilter, Smartphone } from 'lucide-react';
import { totalReset, clearHistory } from '../utils/storage';
import { AppSettings, AppView } from '../types';

const Settings = ({ settings, setSettings, deferredPrompt, handleInstallClick, setView }: any) => {
  const [showSaved, setShowSaved] = useState(false);

  const save = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3"><Palette /> Personnalisation</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40">Couleur des boutons</label>
            <input type="color" value={settings.btnColor} onChange={(e) => save({...settings, btnColor: e.target.value})} className="w-full h-14 rounded-2xl bg-black/20 border-none cursor-pointer" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase opacity-40">Couleur de fond</label>
            <input type="color" value={settings.bgColor} onChange={(e) => save({...settings, bgColor: e.target.value})} className="w-full h-14 rounded-2xl bg-black/20 border-none cursor-pointer" />
          </div>
        </div>
      </section>

      {deferredPrompt && (
        <button onClick={handleInstallClick} className="w-full py-6 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-4">
          <Smartphone /> Installer l'Application
        </button>
      )}

      <button onClick={() => setView(AppView.PREFERENCE_MANAGER)} className="w-full py-6 bg-white/5 border border-white/10 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-4">
        <ListFilter /> Gérer les Préférences
      </button>

      <div className="grid grid-cols-2 gap-4 pt-10">
        <button onClick={() => { if(confirm("Vider l'historique ?")) clearHistory(); }} className="p-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase">Vider l'Historique</button>
        <button onClick={() => { if(confirm("Réinitialisation totale ?")) totalReset(); }} className="p-4 bg-red-500/20 text-red-500 rounded-2xl font-black text-[10px] uppercase">Réinitialisation Totale</button>
      </div>
      
      {showSaved && <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold text-sm animate-bounce">Réglages enregistrés !</div>}
    </div>
  );
};

export default Settings;