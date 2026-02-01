
import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, RefreshCw, Globe, Check, Info, ShieldCheck } from 'lucide-react';
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
  const [selectedPart, setSelectedPart] = useState<StudyPart>('tout');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{title: string, theme?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Persistance des saisies
  useEffect(() => {
    const saved = sessionStorage.getItem(`input_${type}`);
    if (saved) setInput(saved);
  }, [type]);

  const handleInputChange = (val: string) => {
    setInput(val);
    sessionStorage.setItem(`input_${type}`, val);
  };

  const handleGenerate = async (isRetry = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateStudyContent(type, input, selectedPart, settings);
      
      if (!isRetry && !preview) {
        setPreview({ title: result.title, theme: result.theme });
      } else {
        const newStudy: GeneratedStudy = {
          id: Date.now().toString(),
          type,
          title: result.title,
          date: new Date().toLocaleDateString('fr-FR'),
          content: result.text,
          timestamp: Date.now()
        };
        onGenerated(newStudy);
        setPreview(null);
        setInput('');
        sessionStorage.removeItem(`input_${type}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-lg">
            {type === 'WATCHTOWER' ? <Globe size={28} /> : <Calendar size={28} />}
          </div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">{type === 'WATCHTOWER' ? 'Tour de Garde' : 'Vie et Ministère'}</h2>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button onClick={() => setMode('link')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'link' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Lien</button>
          <button onClick={() => setMode('date')} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'date' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Date</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-xl">
        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase opacity-40 ml-1 tracking-widest">Source de l'étude</label>
          <div className="relative">
            <input
              type={mode === 'link' ? "text" : "date"}
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === 'link' ? "Collez le lien jw.org ici..." : ""}
              className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:border-[var(--btn-color)] outline-none transition-all"
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">
              {mode === 'link' ? <LinkIcon size={20} /> : <Calendar size={20} />}
            </div>
          </div>
        </div>

        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-bold flex items-center space-x-2 animate-bounce"><Info size={18}/><span>{error}</span></div>}

        <button
          onClick={() => handleGenerate()}
          disabled={loading || !input}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
          className="w-full py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center space-x-3 shadow-lg active:scale-95 disabled:opacity-20 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          <span>{loading ? "Recherche..." : "Lancer l'Analyse"}</span>
        </button>
      </div>

      {preview && (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--btn-color)]" />
          <div className="flex items-center space-x-2 mb-4 text-[var(--btn-color)]">
            <Check size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Article identifié</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{preview.title}</h3>
          <p className="text-sm opacity-50 mb-6 font-medium italic">{preview.theme || "Thème biblique détecté"}</p>
          
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-8 flex items-start space-x-3">
             <ShieldCheck className="text-blue-400 mt-0.5" size={18} />
             <p className="text-[11px] leading-relaxed opacity-70">
                <strong>Message de confirmation :</strong> L'étude complète va être générée paragraphe par paragraphe. 
                Elle apparaîtra automatiquement dans votre <strong>historique</strong> pour rester accessible <strong>hors ligne</strong>.
             </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => handleGenerate(true)} style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="flex-1 py-3 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg">Confirmer</button>
            <button onClick={() => setPreview(null)} className="flex-1 bg-white/5 border border-white/10 py-3 rounded-lg font-bold text-xs uppercase tracking-widest">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTool;
