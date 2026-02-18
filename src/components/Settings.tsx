import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, Palette, Info, MessageSquareText, 
  Trash2, AlertTriangle, CheckCircle, Download, Smartphone, Languages, Lightbulb, Save
} from 'lucide-react';
import { AppSettings } from '../types'; 
import { saveSettings, clearHistoryOnly, totalReset } from '../utils/storage'; 
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

const getLocalizedText = (settings: AppSettings, key: string) => {
  const texts: { [key: string]: { [lang: string]: string } } = {
    'settingsTitle': { 'fr': 'Paramètres Pro', 'en': 'Pro Settings', 'es': 'Configuración Pro' },
    'settingsSubtitle': { 'fr': 'Personnalisez votre outil expert.', 'en': 'Customize your expert tool.', 'es': 'Personaliza tu herramienta experta.' },
    'installHelpTitle': { 'fr': 'Aide à l\'installation', 'en': 'Installation Help', 'es': 'Ayuda de instalación' },
    'installHelpDesc': { 'fr': 'Installez JW Study pour un accès instantané et hors-ligne :', 'en': 'Install JW Study for instant, offline access:', 'es': 'Instala JW Study para acceso instantáneo y sin conexión:' },
    'installNow': { 'fr': 'Installer maintenant', 'en': 'Install Now', 'es': 'Instalar ahora' },
    'manualGuide': { 'fr': 'Guide Manuel :', 'en': 'Manual Guide:', 'es': 'Guía manual:' },
    'iosInstall': { 'fr': '• iPad / iPhone : Appuyez sur l\'icône (Partager) puis "Sur l\'écran d\'accueil".', 'en': '• iPad / iPhone: Tap the Share icon, then "Add to Home Screen".', 'es': '• iPad / iPhone: Toca el icono Compartir, luego "Añadir a pantalla de inicio".' },
    'androidInstall': { 'fr': '• Android : Appuyez sur les 3 points (en haut à droite) puis "Installer l\'application".', 'en': '• Android: Tap the 3 dots (top right), then "Install app".', 'es': '• Android: Toca los 3 puntos (arriba a la derecha), luego "Instalar aplicación".' },
    'buttonColorTitle': { 'fr': 'Couleur des Boutons', 'en': 'Button Color', 'es': 'Color de los botones' },
    'backgroundColorTitle': { 'fr': 'Couleur de Fond', 'en': 'Background Color', 'es': 'Color de fondo' },
    'colorInputPlaceholder': { 'fr': 'Nom ou Code Hexa (ex: Bleu ciel, #4A70B5)', 'en': 'Name or Hex Code (e.g., Sky Blue, #4A70B5)', 'es': 'Nombre o Código Hex (ej. Azul cielo, #4A70B5)' },
    'colorSuggestions': { 'fr': 'Suggestions de couleurs', 'en': 'Color Suggestions', 'es': 'Sugerencias de colores' },
    'aiPreferencesTitle': { 'fr': 'Préférences IA', 'en': 'AI Preferences', 'es': 'Preferencias de IA' },
    'aiPreferencesPlaceholder': { 'fr': 'Ex: Sois bref, utilise un ton simple...', 'en': 'Ex: Be brief, use a simple tone...', 'es': 'Ej: Sé breve, usa un tono sencillo...' },
    'confirmChanges': { 'fr': 'Confirmer les modifications', 'en': 'Confirm Changes', 'es': 'Confirmar cambios' },
    'savedMessage': { 'fr': 'Enregistré dans le cache local !', 'en': 'Saved to local cache!', 'es': '¡Guardado en caché local!' },
    'dangerZoneTitle': { 'fr': 'Zone de danger', 'en': 'Danger Zone', 'es': 'Zona de peligro' },
    'totalResetConfirm': { 'fr': 'Tout supprimer définitivement ?', 'en': 'Delete everything permanently?', 'es': '¿Eliminar todo permanentemente?' },
    'totalResetButton': { 'fr': 'Réinitialisation Totale', 'en': 'Total Reset', 'es': 'Restablecimiento total' },
    'clearHistoryButton': { 'fr': 'Réinitialiser l\'historique seulement', 'en': 'Clear History Only', 'es': 'Borrar solo el historial' },
    'clearHistoryConfirm': { 'fr': 'Voulez-vous supprimer tout l\'historique ?', 'en': 'Do you want to delete all history?', 'es': '¿Desea eliminar todo el historial?' },
    'languageSettings': { 'fr': 'Paramètres de Langue', 'en': 'Language Settings', 'es': 'Configuración de idioma' },
    'selectLanguage': { 'fr': 'Sélectionner la langue', 'en': 'Select Language', 'es': 'Seleccionar idioma' },
    'modelSelection': { 'fr': 'Sélection du Modèle IA', 'en': 'AI Model Selection', 'es': 'Selección del modelo de IA' },
    'modelName': { 'fr': 'Nom du modèle', 'en': 'Model Name', 'es': 'Nombre del modelo' },
    'french': { 'fr': 'Français', 'en': 'French', 'es': 'Francés' },
    'english': { 'fr': 'Anglais', 'en': 'English', 'es': 'Inglés' },
    'spanish': { 'fr': 'Espagnol', 'en': 'Spanish', 'es': 'Español' },
  };
  return texts[key]?.[settings.language] || texts[key]?.['fr'];
};


const Settings: React.FC<Props> = ({ settings, setSettings, deferredPrompt, handleInstallClick }) => {
  const [draftSettings, setDraftSettings] = useState<AppSettings>(settings);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [buttonColorQuery, setButtonColorQuery] = useState(''); // Separate query for button color
  const [backgroundColorQuery, setBackgroundColorQuery] = useState(''); // Separate query for background color


  useEffect(() => {
    setDraftSettings(settings);
    setButtonColorQuery(settings.customButtonHex || settings.buttonColor);
    setBackgroundColorQuery(settings.customHex || settings.backgroundColor);
  }, [settings]);

  // Helper to convert hex to RGB
  const hexToRgb = (hex: string) => {
    if (!hex || hex.length < 4 || !/^#([0-9A-F]{3}){1,2}$/i.test(hex)) return { r: 0, g: 0, b: 0 }; // Default for invalid hex
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

  const applyColorFromQuery = (query: string, type: 'button' | 'background') => {
    if (/^#([0-9A-F]{3}){1,2}$/i.test(query)) {
      handleDraftChange(type === 'button' ? 'buttonColor' : 'backgroundColor', query);
      handleDraftChange(type === 'button' ? 'customButtonHex' : 'customHex', query);
    } else {
      const matchedColor = baseColors.find(c => c.name.toLowerCase() === query.toLowerCase());
      if (matchedColor) {
        handleDraftChange(type === 'button' ? 'buttonColor' : 'backgroundColor', matchedColor.hex);
        handleDraftChange(type === 'button' ? 'customButtonHex' : 'customHex', matchedColor.hex);
        if (type === 'button') setButtonColorQuery(matchedColor.hex);
        else setBackgroundColorQuery(matchedColor.hex);
      }
    }
  };

  const handleSaveSettings = () => {
    setSettings(draftSettings);
    saveSettings(draftSettings);
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  const handleClearHistory = () => {
    if (window.confirm(getLocalizedText(settings, 'clearHistoryConfirm'))) {
      clearHistoryOnly();
      // Optionally update history state in App.tsx if needed
      // window.location.reload(); // Or dispatch an event to App.tsx
      setShowSavedMessage(true); // Indicate action for user
      setTimeout(() => setShowSavedMessage(false), 3000);
    }
  };

  const currentButtonSuggestions = getSuggestedColors(buttonColorQuery || draftSettings.customButtonHex || draftSettings.buttonColor);
  const currentBackgroundSuggestions = getSuggestedColors(backgroundColorQuery || draftSettings.customHex || draftSettings.backgroundColor);


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:max-w-5xl md:mx-auto"> 
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-lg">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">{getLocalizedText(settings, 'settingsTitle')}</h2>
          <p className="opacity-50 text-sm italic">{getLocalizedText(settings, 'settingsSubtitle')}</p>
        </div>
      </div>

      {/* Guide Installation Permanent */}
      <section className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-[2.5rem] p-8 space-y-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-3 text-blue-400">
          <Smartphone size={24} />
          <h3 className="font-black uppercase text-lg">{getLocalizedText(settings, 'installHelpTitle')}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-sm opacity-70">{getLocalizedText(settings, 'installHelpDesc')}</p>
            {deferredPrompt ? (
              <button onClick={handleInstallClick} className="w-full py-4 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-xl shadow-lg">{getLocalizedText(settings, 'installNow')}</button>
            ) : (
              <div className="p-5 bg-white/5 rounded-2xl border border-white/10 text-xs space-y-4">
                <p className="font-bold flex items-center gap-2 text-blue-400"><Info size={14}/> {getLocalizedText(settings, 'manualGuide')}</p>
                <div className="space-y-2 opacity-60">
                  <p>{getLocalizedText(settings, 'iosInstall')}</p>
                  <p>{getLocalizedText(settings, 'androidInstall')}</p>
                </div>
              </div>
            )}
          </div>
          <div className="hidden md:flex items-center justify-center opacity-10">
            <Download size={100} />
          </div>
        </div>
      </section>

      {/* Language Selection */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <Languages size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">{getLocalizedText(settings, 'languageSettings')}</h3>
        </div>
        <select 
          value={draftSettings.language} 
          onChange={(e) => handleDraftChange('language', e.target.value as 'fr' | 'en' | 'es')}
          className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 outline-none focus:border-[var(--btn-color)] transition-all font-medium text-white/80"
        >
          <option value="fr">{getLocalizedText(settings, 'french')}</option>
          <option value="en">{getLocalizedText(settings, 'english')}</option>
          <option value="es">{getLocalizedText(settings, 'spanish')}</option>
        </select>
      </section>

      {/* AI Model Selection */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <Lightbulb size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">{getLocalizedText(settings, 'modelSelection')}</h3>
        </div>
        <div className="relative">
          <input 
            type="text" 
            value={draftSettings.modelName} 
            readOnly // Make it read-only as per guidelines
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 outline-none font-medium text-white/80"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] uppercase opacity-40">({getLocalizedText(settings, 'modelName')})</span>
        </div>
      </section>

      {/* Button Color Improved */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <Palette size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">{getLocalizedText(settings, 'buttonColorTitle')}</h3>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            value={buttonColorQuery} 
            onChange={e => setButtonColorQuery(e.target.value)} 
            onBlur={() => applyColorFromQuery(buttonColorQuery, 'button')}
            placeholder={getLocalizedText(settings, 'colorInputPlaceholder')}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 outline-none focus:border-[var(--btn-color)]"
          />
          <p className="text-[10px] font-bold uppercase opacity-40 ml-2 mt-2 tracking-widest">{getLocalizedText(settings, 'colorSuggestions')}</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
            {currentButtonSuggestions.slice(0, 5).map(c => (
              <button 
                key={c.hex} 
                onClick={() => {
                  handleDraftChange('buttonColor', c.hex);
                  handleDraftChange('customButtonHex', c.hex);
                  setButtonColorQuery(c.hex);
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

      {/* Background Color Improved */}
      <section className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl">
        <div className="flex items-center space-x-2 opacity-70">
          <Palette size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">{getLocalizedText(settings, 'backgroundColorTitle')}</h3>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            value={backgroundColorQuery} 
            onChange={e => setBackgroundColorQuery(e.target.value)} 
            onBlur={() => applyColorFromQuery(backgroundColorQuery, 'background')}
            placeholder={getLocalizedText(settings, 'colorInputPlaceholder')}
            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 px-5 outline-none focus:border-[var(--btn-color)]"
          />
          <p className="text-[10px] font-bold uppercase opacity-40 ml-2 mt-2 tracking-widest">{getLocalizedText(settings, 'colorSuggestions')}</p>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-2">
            {currentBackgroundSuggestions.slice(0, 5).map(c => (
              <button 
                key={c.hex} 
                onClick={() => {
                  handleDraftChange('backgroundColor', c.hex);
                  handleDraftChange('customHex', c.hex);
                  setBackgroundColorQuery(c.hex);
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
          <h3 className="font-bold uppercase text-xs tracking-widest">{getLocalizedText(settings, 'aiPreferencesTitle')}</h3>
          <button onClick={handleSaveSettings} className="ml-auto p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/40 transition-all">
            <Save size={20} />
          </button>
        </div>
        <textarea
          value={draftSettings.answerPreferences}
          onChange={(e) => handleDraftChange('answerPreferences', e.target.value)}
          placeholder={getLocalizedText(settings, 'aiPreferencesPlaceholder')}
          className="w-full h-32 bg-black/20 border border-white/10 rounded-2xl py-4 px-5 focus:border-[var(--btn-color)] outline-none resize-none text-sm"
        />
      </section>

      {!isEqual(settings, draftSettings) && (
        <button onClick={handleSaveSettings} style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-full py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2">
          <CheckCircle size={20} /> {getLocalizedText(settings, 'confirmChanges')}
        </button>
      )}

      {showSavedMessage && <p className="text-center text-emerald-400 font-bold animate-pulse text-xs uppercase">{getLocalizedText(settings, 'savedMessage')}</p>}

      <section className="bg-red-500/5 border border-red-500/10 rounded-3xl p-8 space-y-4">
        <div className="flex items-center space-x-2 text-red-400 opacity-70">
          <AlertTriangle size={18} />
          <h3 className="font-bold uppercase text-xs tracking-widest">{getLocalizedText(settings, 'dangerZoneTitle')}</h3>
        </div>
        <button onClick={handleClearHistory} className="w-full py-4 bg-red-500/10 text-red-400 rounded-xl font-bold text-xs uppercase hover:bg-red-500/20 transition-all mb-4">{getLocalizedText(settings, 'clearHistoryButton')}</button>
        <button onClick={() => { if(window.confirm(getLocalizedText(settings, 'totalResetConfirm'))) totalReset(); }} className="w-full py-4 bg-red-500/10 text-red-400 rounded-xl font-bold text-xs uppercase hover:bg-red-500/20 transition-all">
          {getLocalizedText(settings, 'totalResetButton')}
        </button>
      </section>
    </div>
  );
};

export default Settings;