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

// Define base colors outside the component to be accessible for suggestions
const baseColors = [
  { name: "Bleu JW", hex: "#4a70b5" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Émeraude", hex: "#10b981" },
  { name: "Ambre", hex: "#f59e0b" },
  { name: "Rose", hex: "#ec4899" },
  { name: "Nuit", hex: "#09090b" },
  { name: "Lumière", hex: "#f4f4f5" },
];

const Settings: React.FC<Props> = ({ settings, setSettings, deferredPrompt, handleInstallClick }) => {
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [colorQuery, setColorQuery] = useState('');

  useEffect(() => {
    setDraftSettings(settings);
  }, [settings]);

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    if (!hex || hex.length < 4) return { r: 0, g: 0, b: 0 }; // Default for invalid hex
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  // Function to suggest colors based on hex input
  const getSuggestedColors = (inputHex: string) => {
    if (!inputHex || inputHex.length < 4 || !/^#([0-9A-F]{3}){1,2}$/i.test(inputHex)) {
      return baseColors; // Show general suggestions for short or invalid input
    }

    const queryRgb = hexToRgb(inputHex);
    const distances = baseColors.map(color => {
      const { r, g, b } = hexToRgb(color.hex);
      const dist = Math.sqrt(
        Math.pow(queryRgb.r - r, 2) +
        Math.pow(queryRgb.g - g, 2) +
        Math.pow(queryRgb.b - b, 2)
      );
      return { ...color, dist };
    });

    return distances.sort((a, b) => a.dist - b.dist).slice(0, 5); // Return top 5 closest
  };


  const handleDraftChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setDraftSettings({ ...draftSettings, [key]: value });
  };

  const handleCustomHexChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'background' | 'button') => {
    const value = e.target.value.trim();
    setDraftSettings(prev => {
      const newDraft = { ...prev };
      if (type === 'background') {
        newDraft.customHex = value;
        if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) newDraft.backgroundColor = value;
      } else { // type === 'button'
        newDraft.customButtonHex = value;
        if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) newDraft.buttonColor = value;
      }
      return newDraft;
    });
  };

  const handleSaveSettings = () => {
    setSettings(draftSettings);
    saveSettings(draftSettings);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  // Fix: Use baseColors or getSuggestedColors here for matching by name
  const currentButtonSuggestions = getSuggestedColors(colorQuery || draftSettings.customButtonHex || draftSettings.buttonColor);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:max-w-5xl md:mx-auto"> 
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-lg">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Paramètres Pro</h2>
          <p className="opacity-50 text-sm italic">Personnalisez votre outil expert.</p>
        </div>
      </div>

      {/* Guide Installation Permanent */}
      <section className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3 text-blue-400">
          <Smartphone size={24} />
          <h3 className="font-black uppercase text-lg">Aide à l'installation</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-sm opacity-70">Installez JW Study pour un accès instantané et hors-ligne :</p>
            {deferredPrompt ? (
              <button onClick={handleInstallClick} className="w-full py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg">Installer maintenant</button>
            ) : (
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-4">
                <p className="font-bold flex items-center gap-2 text-blue-400"><Info size={14}/> Guide Manuel :</p>
                <div className="space-y-2 opacity-60">
                  <p>• <b>iPad / iPhone :</b> Appuyez sur l'icône <Download size={14} className="inline mx-1"/> (Partager) puis "Sur l'écran d'accueil".</p>
                  <p>• <b>Android :</b> Appuyez sur les 3 points (en haut à droite) puis "Installer l'application".</p>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center justify-center opacity-10">
            <Download size={100} />
          </div>
        </div>
      </section>

      {/* Couleurs Améliorées */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <Palette size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Couleur des Boutons</h3>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            value={colorQuery} 
            onChange={e => setColorQuery(e.target.value)} 
            onBlur={() => { // Apply color if it's a valid hex when user blurs
              if (/^#([0-9A-F]{3}){1,2}$/i.test(colorQuery)) {
                handleDraftChange('buttonColor', colorQuery);
              } else { // Try to find by name from baseColors
                const matchedColor = baseColors.find(c => c.name.toLowerCase() === colorQuery.toLowerCase());
                if (matchedColor) handleDraftChange('buttonColor', matchedColor.hex);
              }
            }}
            placeholder="Nom ou Code Hexa (ex: Bleu ciel, #4A70B5)"
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 outline-none focus:border-[var(--btn-color)]"
          />
          <p className="text-[10px] font-bold uppercase opacity-40 ml-2 mt-2 tracking-widest">Suggestions de couleurs</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
            {currentButtonSuggestions.slice(0, 5).map(c => (
              <button 
                key={c.hex} 
                onClick={() => {
                  handleDraftChange('buttonColor', c.hex);
                  setColorQuery(c.hex); // Also update query for visual feedback
                }}
                className="flex flex-col items-center gap-2 p-2 hover:bg-white/5 rounded-xl transition-all"
              >
                <div className="w-10 h-10 rounded-full shadow-lg" style={{ backgroundColor: c.hex }} />
                <span className="text-[8px] font-bold uppercase opacity-40">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="flex items-center space-x-2 opacity-70">
          <MessageSquareText size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Préférences IA</h3>
        </div>
        <textarea
          value={draftSettings.answerPreferences}
          onChange={(e) => handleDraftChange('answerPreferences', e.target.value)}
          placeholder="Ex: Sois bref, utilise un ton simple..."
          className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl py-4 px-5 focus:border-[var(--btn-color)] outline-none resize-none text-sm"
        />
      </section>

      {!isEqual(settings, draftSettings) && (
        <button onClick={handleSaveSettings} style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
          <CheckCircle size={20} /> Confirmer les modifications
        </button>
      )}

      {showSavedMessage && <p className="text-center text-emerald-400 font-bold animate-pulse text-xs uppercase">Enregistré dans le cache local !</p>}

      <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-4">
        <div className="flex items-center space-x-2 text-red-400 opacity-70">
          <AlertTriangle size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">Zone de danger</h3>
        </div>
        <button onClick={() => { if(window.confirm("Tout supprimer définitivement ?")) totalReset(); }} className="w-full py-4 bg-red-500/10 text-red-400 rounded-xl font-bold text-xs uppercase hover:bg-red-500/20 transition-all">Réinitialisation Totale</button>
      </section>
    </div>
  );
};

export default Settings;