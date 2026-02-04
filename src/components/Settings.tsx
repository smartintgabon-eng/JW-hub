
import React from 'react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Info, 
  MessageSquareText, 
  MousePointer2, 
  Trash2, 
  RotateCcw, 
  AlertTriangle 
} from 'lucide-react';
import { AppSettings } from '../types'; 
import { saveSettings, clearHistory, totalReset } from '../utils/storage'; 

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Settings: React.FC<Props> = ({ settings, setSettings }) => {
  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings };
    // Clear custom hex if a preset is chosen
    if (key === 'backgroundColor' && value !== settings.customHex) newSettings.customHex = '';
    if (key === 'buttonColor' && value !== settings.customButtonHex) newSettings.customButtonHex = '';
    
    // Update the actual setting
    (newSettings as any)[key] = value; 

    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'background' | 'button') => {
    const value = e.target.value.trim();
    const newSettings = { ...settings };
    
    // Regex simple pour valider un hex valide (3 ou 6 caractères après #)
    const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(value);

    if (type === 'background') {
      newSettings.customHex = value;
      if (isValidHex) {
        newSettings.backgroundColor = value;
      } else if (value === '' || value === '#') { // Allow empty or just '#' to not break preview, fallback to default for actual setting
        newSettings.backgroundColor = '#09090b'; 
      } else {
        // If invalid but not empty/hash, keep the current background color, don't break the UI
        // This ensures the preview for custom hex stays, but the actual setting is not changed to invalid.
        newSettings.backgroundColor = settings.backgroundColor; 
      }
    } else { // type === 'button'
      newSettings.customButtonHex = value;
      if (isValidHex) {
        newSettings.buttonColor = value;
      } else if (value === '' || value === '#') { // Allow empty or just '#' to not break preview, fallback to default for actual setting
        newSettings.buttonColor = '#4a70b5';
      } else {
        newSettings.buttonColor = settings.buttonColor;
      }
    }
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleClearHistory = () => {
    if (window.confirm("⚠️ ATTENTION : Voulez-vous supprimer TOUTES les études de l'historique ? Cette action est irréversible.")) {
      clearHistory();
      alert("Historique effacé avec succès.");
      window.location.reload(); // Recharger pour rafraîchir l'état
    }
  };

  const handleResetApp = async () => {
    const confirm = window.confirm(
      "☢️ RÉINITIALISATION TOTALE\n\nCela va supprimer :\n- Tout l'historique\n- Tous vos réglages\n- Les fichiers mis en cache (PWA)\n\nL'application redeviendra comme neuve. Continuer ?"
    );
    
    if (confirm) {
      await totalReset();
    }
  };

  const bgOptions = [
    { name: 'Nuit', value: '#09090b' },
    { name: 'Ardoise', value: '#1e293b' },
    { name: 'JW Bleu', value: '#1a3a5f' },
    { name: 'Lumière', value: '#f4f4f5' },
    { name: 'Sable', value: '#fef3c7' },
  ];

  const btnOptions = [
    { name: 'Bleu Pro', value: '#4a70b5' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Émeraude', value: '#10b981' },
    { name: 'Ambre', value: '#f59e0b' },
    { name: 'Rose', value: '#ec4899' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-lg">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Paramètres</h2>
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
          <label className="text-[10px] font-bold uppercase opacity-40 block mb-2">Code couleur personnalisé (Hex)</label>
          <input
            type="text"
            value={settings.customHex}
            onChange={(e) => handleCustomHexChange(e, 'background')}
            placeholder="Ex: #09090b"
            className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 font-mono text-sm focus:border-[var(--btn-color)] outline-none"
          />
          <div className="w-full h-10 rounded-lg mt-2 border-2 border-white/10" style={{ backgroundColor: settings.customHex || settings.backgroundColor }} />
          <p className="text-[10px] opacity-30 text-center font-bold italic mt-2">La prévisualisation en direct s'affichera ci-dessus.</p>
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
            placeholder="Ex: Sois bref dans les réponses, utilise un ton simple pour les enfants..."
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
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {btnOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateSetting('buttonColor', opt.value)}
              className={`p-4 rounded-xl border-2 transition-all ${
                (settings.buttonColor === opt.value && !settings.customButtonHex) ? 'border-white bg-white/5' : 'border-white/5'
              }`}
            >
              <div className="w-full h-8 rounded-lg mb-2" style={{ backgroundColor: opt.value }} />
              <span className="text-[10px] font-bold uppercase block text-center opacity-60">{opt.name}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4 pt-4 border-t border-white/5">
          <input
            type="text"
            value={settings.customButtonHex}
            onChange={(e) => handleCustomHexChange(e, 'button')}
            placeholder="Ex: #4a70b5"
            className="flex-1 bg-black/20 border border-white/10 rounded-xl py-3 px-4 font-mono text-sm focus:border-[var(--btn-color)] outline-none"
          />
          <div className="w-12 h-12 rounded-xl shadow-lg border-2 border-white/10" style={{ backgroundColor: settings.customButtonHex || settings.buttonColor }} />
        </div>
        <p className="text-[10px] opacity-30 text-center font-bold italic mt-2">La prévisualisation en direct s'affichera à droite.</p>
      </section>

      {/* ZONE DE DANGER */}
      <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 text-red-400 opacity-70">
          <AlertTriangle size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Zone de danger</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={handleClearHistory}
            className="flex items-center justify-center space-x-3 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-500/20 transition-all active:scale-95"
          >
            <Trash2 size={18} />
            <span>Effacer Historique</span>
          </button>
          
          <button 
            onClick={handleResetApp}
            className="flex items-center justify-center space-x-3 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 font-black uppercase text-[10px] tracking-[0.2em] hover:bg-amber-500/20 transition-all active:scale-95"
          >
            <RotateCcw size={18} />
            <span>Réinitialisation Totale</span>
          </button>
        </div>
        <p className="text-[10px] opacity-30 text-center font-bold italic">Attention : La réinitialisation totale efface TOUT et vide le cache de l'appareil.</p>
      </section>
    </div>
  );
};

export default Settings;