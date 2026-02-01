
import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Globe, Check, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';
import { StudyPart, GeneratedStudy, AppSettings } from '../types';
import { generateStudyContent } from '../services/geminiService';

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
}

const StudyTool: React.FC<Props> = ({ type, onGenerated, settings }) => {
  const [mode, setMode] = useState<'link' | 'date'>('link');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [preview, setPreview] = useState<{title: string, theme?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`draft_${type}`);
    if (saved) setInput(saved);
  }, [type]);

  const handleInputChange = (val: string) => {
    setInput(val);
    localStorage.setItem(`draft_${type}`, val);
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setLoadingStep('');
    setPreview(null);
  };

  const handleGenerate = async (isRetry = false) => {
    if (loading || !input.trim()) return;
    
    setLoading(true);
    setError(null);
    setLoadingStep('Préparation...');
    
    try {
      setLoadingStep('Recherche sur jw.org...');
      if (isRetry) setLoadingStep('Génération des réponses...');
      
      const result = await generateStudyContent(type, input.trim(), 'tout', settings);
      
      if (!isRetry && !preview) {
        setPreview({ title: result.title, theme: result.theme });
      } else {
        setLoadingStep('Enregistrement...');
        const newStudy: GeneratedStudy = {
          id: Date.now().toString(),
          type,
          title: result.title,
          date: new Date().toLocaleDateString('fr-FR'),
          content: result.text,
          timestamp: Date.now(),
          url: input.startsWith('http') ? input.trim() : undefined
        };
        onGenerated(newStudy);
        setPreview(null);
        setInput('');
        localStorage.removeItem(`draft_${type}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-xl">
            {type === 'WATCHTOWER' ? <Globe size={28} /> : <Calendar size={28} />}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier de Réunion'}</h2>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button onClick={() => { setMode('link'); setInput(''); setError(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'link' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Lien</button>
          <button onClick={() => { setMode('date'); setInput(''); setError(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'date' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Date</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]">
            {mode === 'link' ? "Collez le lien jw.org" : "Sélectionnez la semaine"}
          </label>
          <div className="relative">
            <input
              type={mode === 'link' ? "text" : "date"}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === 'link' ? "https://www.jw.org/fr/..." : ""}
              className={`w-full bg-black/40 border border-white/10 rounded-xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium ${error ? 'border-red-500/50' : ''}`}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">
              {mode === 'link' ? <LinkIcon size={22} /> : <Calendar size={22} />}
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-bold flex flex-col space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="flex items-start space-x-3">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-red-500" />
              <div className="space-y-1">
                 <p>{error}</p>
                 {error.includes('LIMITE') && <p className="text-xs opacity-60 font-normal">C'est une restriction de Google sur les comptes gratuits. Inutile de réinitialiser le site, il faut juste patienter.</p>}
              </div>
            </div>
            <button 
              onClick={() => resetState()} 
              className="text-[10px] uppercase tracking-[0.2em] bg-white/10 self-center px-6 py-2 rounded-full hover:bg-white/20 transition-all flex items-center space-x-2 border border-white/5"
            >
              <RefreshCw size={12} />
              <span>Réessayer maintenant</span>
            </button>
          </div>
        )}

        <button
          onClick={() => handleGenerate()}
          disabled={loading || !input.trim()}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
          className="w-full py-6 rounded-xl font-black uppercase tracking-widest flex flex-col items-center justify-center space-y-1 shadow-2xl active:scale-95 disabled:opacity-20 transition-all min-h-[100px]"
        >
          {loading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="animate-spin" size={28} />
              <span className="text-[10px] opacity-70 animate-pulse font-bold tracking-widest">{loadingStep}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Search size={24} />
              <span className="text-xl">Lancer l'Analyse</span>
            </div>
          )}
        </button>
      </div>

      {preview && (
        <div className="bg-white/5 border border-white/20 rounded-[2.5rem] p-10 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--btn-color)] shadow-[0_0_15px_var(--btn-color)]" />
          <div className="flex items-center space-x-3 mb-6 text-[var(--btn-color)]">
            <Check size={24} className="stroke-[3]" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Article Détecté</span>
          </div>
          <h3 className="text-3xl font-black mb-3 leading-tight uppercase tracking-tighter">{preview.title}</h3>
          <p className="text-lg opacity-60 mb-8 font-serif italic">{preview.theme || "Prêt pour la préparation"}</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => handleGenerate(true)} 
              disabled={loading}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
              className="flex-1 py-5 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              <span>{loading ? "Génération..." : "Confirmer & Générer"}</span>
            </button>
            <button onClick={() => setPreview(null)} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTool;
