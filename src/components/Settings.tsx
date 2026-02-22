import React, { useState, useEffect } from 'react';
import { Palette, Check, Settings as IconSettings, Trash2, RotateCcw, ListFilter, Globe, Smartphone } from 'lucide-react';
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
          <input value={btnQuery} onChange={(e) => {setBtnQuery(e.target.value); setDraft({...draft, btnColor: e.target.value})}} placeholder="Couleur boutons (Nom ou Hex)" className="w-full bg-black/20 p-4 rounded-xl outline-none border border-white/5 focus:border-[var(--btn-color)]"/>
          <div className="flex gap-2 mt-2">
            {getSuggestions(btnQuery).map(c => (
              <button key={c.hex} onClick={() => {setDraft({...draft, btnColor: c.hex}); setBtnQuery(c.name)}} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">● {c.name}</button>
            ))}
          </div>
        </div>

        {/* Fond (Point 2) */}
        <div className="relative">
          <input value={bgQuery} onChange={(e) => {setBgQuery(e.target.value); setDraft({...draft, bgColor: e.target.value})}} placeholder="Couleur fond (Nom ou Hex)" className="w-full bg-black/20 p-4 rounded-xl outline-none border border-white/5 focus:border-[var(--btn-color)]"/>
          <div className="flex gap-2 mt-2">
            {getSuggestions(bgQuery).map(c => (
              <button key={c.hex} onClick={() => {setDraft({...draft, bgColor: c.hex}); setBgQuery(c.name)}} className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10">● {c.name}</button>
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
            <button onClick={() => setView(AppView.PREFERENCE_MANAGER)} className="p-2 bg-white/5 rounded-lg"><ListFilter size={18}/></button>
            <button onClick={saveAiPrefs} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><Check size={18}/></button>
          </div>
        </div>
        <textarea value={draft.answerPreferences} onChange={(e) => setDraft({...draft, answerPreferences: e.target.value})} className="w-full h-32 bg-black/20 p-4 rounded-xl outline-none resize-none text-sm" placeholder="Ex: Toujours citer la TMN..."/>
      </section>

      {/* ZONE DE DANGER (Point 1 & 6) */}
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => {if(window.confirm("Réinitialiser l'historique ?")) clearHistoryOnly()}} className="py-4 bg-red-500/10 text-red-400 rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2"><Trash2 size={14}/> Historique Seul</button>
        <button onClick={() => {if(window.confirm("Tout réinitialiser ?")) totalReset()}} className="py-4 bg-red-500/20 text-red-400 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><RotateCcw size={14}/> Réinitialisation Totale</button>
      </div>

      {/* INSTALLATION (Point 3) */}
      {deferredPrompt && (
        <button onClick={handleInstallClick} className="w-full py-6 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-2xl font-black uppercase flex items-center justify-center gap-3 shadow-lg hover:opacity-90 transition-opacity"><Smartphone/> Installer l'Application</button>
      )}
    </div>
  );
};

export default Settings;