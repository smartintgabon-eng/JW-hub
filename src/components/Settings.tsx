
import React, { useState, useEffect } from 'react';
/* Added Download to imports from lucide-react */
import { Palette, CheckCircle, AlertTriangle, Trash2, Globe, Check, Settings as SettingsIcon, Save, Languages, Download, List as ListIcon } from 'lucide-react';
import { AppSettings, AppView } from '../types.ts';
import { saveSettings, clearHistoryOnly } from '../utils/storage.ts';

const baseColors = [
  { name: "Bleu JW", hex: "#4a70b5" },
  { name: "Indigo", hex: "#6366f1" },
  { name: "Émeraude", hex: "#10b981" },
  { name: "Ambre", hex: "#f59e0b" },
  { name: "Rose", hex: "#ec4899" },
  { name: "Nuit", hex: "#09090b" },
  { name: "Lumière", hex: "#f4f4f5" },
];

const Settings: React.FC<{ settings: AppSettings, setSettings: any, deferredPrompt: any, handleInstallClick: () => void }> = ({ settings, setSettings, deferredPrompt, handleInstallClick }) => {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [colorQuery, setColorQuery] = useState('');
  const [bgQuery, setBgQuery] = useState('');
  const [saved, setSaved] = useState(false);

  const filterColors = (q: string) => baseColors.filter(c => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3);

  const handleQuickSave = () => {
    setSettings(draft);
    saveSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      <h2 className="text-3xl font-black uppercase flex items-center gap-3"><SettingsIcon /> Paramètres Pro</h2>

      {/* Couleurs et Langue */}
      <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label className="text-[10px] font-black uppercase opacity-40 ml-2">Langue de l'interface & IA</label>
            <select 
              value={draft.language} 
              onChange={(e) => setDraft({...draft, language: e.target.value as any})}
              className="w-full bg-black/20 border border-white/10 rounded-xl p-4 mt-1 outline-none focus:border-[var(--btn-color)]"
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Couleur des boutons</label>
          <input value={colorQuery} onChange={(e) => setColorQuery(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 mt-1" placeholder="Chercher une couleur (ex: Indigo)..." />
          <div className="flex gap-2 mt-2">
            {filterColors(colorQuery).map(c => (
              <button key={c.hex} onClick={() => {setDraft({...draft, btnColor: c.hex}); setColorQuery(c.name)}} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold" style={{color: c.hex}}>● {c.name}</button>
            ))}
          </div>
        </div>

        <div className="relative">
          <label className="text-[10px] font-black uppercase opacity-40 ml-2">Couleur du fond</label>
          <input value={bgQuery} onChange={(e) => setBgQuery(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-4 mt-1" placeholder="Ex: Nuit, #09090b" />
          <div className="flex gap-2 mt-2">
            {filterColors(bgQuery).map(c => (
              <button key={c.hex} onClick={() => {setDraft({...draft, bgColor: c.hex}); setBgQuery(c.name)}} className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold">● {c.name}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Préférences IA */}
      <section className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <label className="text-xs font-black uppercase opacity-50">Préférences IA</label>
          <div className="flex gap-2">
            <button onClick={() => setSettings(prev => ({...prev, view: AppView.PREFERENCE_MANAGER}))} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
              <ListIcon size={18} /> {/* Bouton Manager */}
            </button>
            <button onClick={handleQuickSave} className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Check size={18} /> {/* Crochet Vert */}
            </button>
          </div>
        </div>
        <textarea 
          value={draft.answerPreferences} 
          onChange={(e) => setDraft({...draft, answerPreferences: e.target.value})}
          placeholder="Ex: Réponds toujours en français, sois encourageant..."
          className="w-full bg-black/20 rounded-xl p-4 text-sm border-none focus:ring-2 focus:ring-emerald-500"
        />
      </section>

      {/* Zone de Danger */}
      <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] space-y-4">
        <h3 className="text-red-400 font-black uppercase text-xs tracking-widest flex items-center gap-2"><AlertTriangle size={14}/> Zone de Danger</h3>
        <button onClick={() => {if(window.confirm("Voulez-vous supprimer TOUT votre historique d'étude ?")) { clearHistoryOnly(); window.location.reload(); }}} className="w-full py-4 border border-red-500/20 text-red-400 rounded-xl font-bold uppercase text-xs hover:bg-red-500/10 transition-all">
          <Trash2 size={14} className="inline mr-2"/> Réinitialiser l'historique uniquement
        </button>
      </div>

      {deferredPrompt && (
        <button onClick={handleInstallClick} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black uppercase shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
          <Download size={24} /> Installer l'application
        </button>
      )}
    </div>
  );
};
export default Settings;
