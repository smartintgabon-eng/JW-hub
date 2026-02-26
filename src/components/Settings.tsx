import React, { useState, useEffect, useCallback } from 'react';
import { Palette, Check, Trash2, RotateCcw, ListFilter, Globe, Smartphone, Loader2 } from 'lucide-react';
import { saveSettings, clearHistoryOnly, totalReset } from '../utils/storage.ts';
import { AppSettings, AppView } from '../types.ts';

const colorSuggestions = [
  { name: 'Bleu JW', hex: '#4a70b5' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Émeraude', hex: '#10b981' },
  { name: 'Ambre', hex: '#f59e0b' },
  { name: 'Rose', hex: '#ec4899' },
  { name: 'Nuit', hex: '#09090b' }
];

const Settings = ({ settings, setSettings, deferredPrompt, handleInstallClick, setView }: { settings: AppSettings, setSettings: any, deferredPrompt: any, handleInstallClick: () => void, setView: (view: AppView) => void }) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [btnQuery, setBtnQuery] = useState('');
  const [bgQuery, setBgQuery] = useState('');
  const [btnColorDescription, setBtnColorDescription] = useState<string | null>(null);
  const [bgColorDescription, setBgColorDescription] = useState<string | null>(null);
  const [isGuessingBtn, setIsGuessingBtn] = useState(false);
  const [isGuessingBg, setIsGuessingBg] = useState(false);

  // Debounced auto-guess pour btnQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      if (btnQuery && btnQuery.length > 2) {
        handleGuessColor(btnQuery, setBtnColorDescription, setIsGuessingBtn, 'btn');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [btnQuery, handleGuessColor]);

  // Debounced auto-guess pour bgQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      if (bgQuery && bgQuery.length > 2) {
        handleGuessColor(bgQuery, setBgColorDescription, setIsGuessingBg, 'bg');
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [bgQuery, handleGuessColor]);

  // Suggestions filtrées (4 max)
  const getSuggestions = (q: string) => colorSuggestions.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 4);

  const saveVisuals = () => {
    setSettings(draft);
    saveSettings(draft);
    // Appliquer immédiatement les couleurs au site
    document.documentElement.style.setProperty('--btn-color', draft.btnColor);
    document.documentElement.style.setProperty('--bg-color', draft.bgColor);
    alert("Réglages visuels et langue enregistrés !");
  };

  const saveAiPrefs = () => {
    setSettings(draft);
    saveSettings(draft);
    alert("Préférences IA sauvegardées !");
  };

  const handleGuessColor = useCallback(async (colorInput: string, setColorDescription: (desc: string | null) => void, setLoader: (l: boolean) => void, type: 'btn' | 'bg') => {
    if (!colorInput || colorInput.length < 3) {
      setColorDescription(null);
      return;
    }
    setLoader(true);
    try {
      const response = await fetch('/api/guess-color', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colorInput, language: draft.language, type }),
      });
      const data = await response.json();
      setColorDescription(data.description || "Impossible d'analyser cette couleur.");
      if (data.hex) {
        if (type === 'btn') {
          setDraft(prev => ({ ...prev, btnColor: data.hex }));
          setBtnQuery(data.hex);
        } else {
          setDraft(prev => ({ ...prev, bgColor: data.hex }));
          setBgQuery(data.hex);
        }
      }
    } catch (error) {
      console.error('Error guessing color:', error);
      setColorDescription("Erreur d'analyse de couleur.");
    } finally {
      setLoader(false);
    }
  }, [draft.language, setDraft]);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-8">
      {/* SECTION VISUELLE & LANGUE */}
      <section className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-6">
        <h3 className="flex items-center gap-2 font-black uppercase text-sm"><Palette size={18}/> Style & Langue</h3>
        
        {/* Langue (Point 9) */}
        <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl">
           <div className="flex items-center gap-2"><Globe size={18}/> <span>Langue du site & IA</span></div>
           <select value={draft.language} onChange={(e) => setDraft({...draft, language: e.target.value as any})} className="bg-transparent font-bold outline-none">
              <option value="fr">Français</option>
              <option value="en">English</option>
           </select>
        </div>

        {/* Boutons (Point 1) */}
        <div className="relative">
          <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest mb-2 block">Couleur des boutons</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                value={btnQuery} 
                onChange={(e) => {setBtnQuery(e.target.value); setBtnColorDescription(null);}} 
                placeholder="Décrivez une couleur ou entrez un hex (ex: 'bleu océan' ou #123456)" 
                className="w-full bg-black/20 p-4 rounded-xl outline-none border border-white/5 focus:border-[var(--btn-color)] transition-all"
              />
              {isGuessingBtn && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin opacity-50" />}
            </div>
            <div className="w-12 h-12 rounded-xl border border-white/10 shadow-inner" style={{ backgroundColor: draft.btnColor }}></div>
          </div>
          {btnColorDescription && (
            <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-top-2 duration-300">
              <p className="text-xs leading-relaxed italic opacity-80">{btnColorDescription}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {getSuggestions(btnQuery).map(c => (
              <button key={c.hex} onClick={() => {setDraft({...draft, btnColor: c.hex}); setBtnQuery(c.name); setBtnColorDescription(null);}} className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">● {c.name}</button>
            ))}
          </div>
        </div>

        {/* Fond (Point 2) */}
        <div className="relative">
          <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest mb-2 block">Couleur de fond</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input 
                value={bgQuery} 
                onChange={(e) => {setBgQuery(e.target.value); setBgColorDescription(null);}} 
                placeholder="Décrivez une couleur ou entrez un hex (ex: 'vert forêt' ou #654321)" 
                className="w-full bg-black/20 p-4 rounded-xl outline-none border border-white/5 focus:border-[var(--btn-color)] transition-all"
              />
              {isGuessingBg && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin opacity-50" />}
            </div>
            <div className="w-12 h-12 rounded-xl border border-white/10 shadow-inner" style={{ backgroundColor: draft.bgColor }}></div>
          </div>
          {bgColorDescription && (
            <div className="mt-3 p-4 bg-white/5 rounded-2xl border border-white/5 animate-in slide-in-from-top-2 duration-300">
              <p className="text-xs leading-relaxed italic opacity-80">{bgColorDescription}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-3">
            {getSuggestions(bgQuery).map(c => (
              <button key={c.hex} onClick={() => {setDraft({...draft, bgColor: c.hex}); setBgQuery(c.name); setBgColorDescription(null);}} className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all">● {c.name}</button>
            ))}
          </div>
        </div>

        <button onClick={saveVisuals} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-xs transition-all">Sauvegarder le style</button>
      </section>

      {/* SECTION PRÉFÉRENCES IA (Point 10) */}
      <section className="bg-white/5 p-6 rounded-[2rem] border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black uppercase text-sm">Préférences IA</h3>
          <div className="flex gap-2">
            <button onClick={() => setView(AppView.PREFERENCE_MANAGER)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"><ListFilter size={18}/></button>
            <button onClick={saveAiPrefs} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all"><Check size={18}/></button>
          </div>
        </div>
        <div className="space-y-2">
          {!draft.answerPreferences || draft.answerPreferences.length === 0 ? (
            <p className="text-sm opacity-50 italic">Aucune préférence enregistrée.</p>
          ) : (
            <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
              {draft.answerPreferences.map(p => (
                <div key={p.id} className="text-xs bg-black/20 p-3 rounded-xl border border-white/5">
                  {p.text}
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={() => setView(AppView.PREFERENCE_MANAGER)}
            className="w-full py-3 mt-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase transition-all flex items-center justify-center gap-2"
          >
            <ListFilter size={14} /> Gérer les préférences
          </button>
        </div>
      </section>

      {/* ZONE DE DANGER (Point 1 & 6) */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => {if(window.confirm("Réinitialiser l'historique ?")) clearHistoryOnly()}} className="py-4 bg-red-500/10 text-red-400 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2"><Trash2 size={14}/> Historique Seul</button>
        <button onClick={() => {if(window.confirm("Tout réinitialiser ?")) totalReset()}} className="py-4 bg-red-500/20 text-red-400 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><RotateCcw size={14}/> Réinitialisation Totale</button>
      </div>

      {/* INSTALLATION (Point 3) */}
      {deferredPrompt && (
        <button onClick={handleInstallClick} className="w-full py-6 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-2xl font-black uppercase flex items-center justify-center gap-3 shadow-lg hover:opacity-90 transition-opacity"><Smartphone/> Installer l&apos;Application</button>
      )}
    </div>
  );
};

export default Settings;