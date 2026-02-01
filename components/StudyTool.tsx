
import React, { useState } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, RefreshCw, Globe, ChevronRight } from 'lucide-react';
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
  const [preview, setPreview] = useState<{title: string, content: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (isRetry = false) => {
    const finalInput = mode === 'link' ? input : `Semaine du ${input}`;
    if (!input) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await generateStudyContent(type, finalInput, selectedPart);
      if (!isRetry && !preview) {
        setPreview({ title: result.title, content: result.text });
      } else {
        const newStudy: GeneratedStudy = {
          id: Date.now().toString(),
          type,
          title: result.title,
          date: new Date().toLocaleDateString('fr-FR'),
          url: input.startsWith('http') ? input : undefined,
          content: result.text,
          timestamp: Date.now()
        };
        onGenerated(newStudy);
        setPreview(null);
        setInput('');
      }
    } catch (err: any) {
      setError(err.message || "Erreur de génération.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center space-x-6">
          <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-5 rounded-[2rem] shadow-2xl">
            {type === 'WATCHTOWER' ? <Globe size={36} /> : <Calendar size={36} />}
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter">{type === 'WATCHTOWER' ? 'La Tour de Garde' : 'Vie et Ministère'}</h2>
            <p className="opacity-50 font-bold">Préparation assistée par IA</p>
          </div>
        </div>

        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 self-start md:self-center">
          <button 
            onClick={() => setMode('link')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'link' ? 'bg-white/10 shadow-lg' : 'opacity-40 hover:opacity-100'}`}
          >
            Lien Direct
          </button>
          <button 
            onClick={() => setMode('date')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'date' ? 'bg-white/10 shadow-lg' : 'opacity-40 hover:opacity-100'}`}
          >
            Par Date
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 space-y-10 shadow-2xl">
        <div className="space-y-4">
          <label className="text-xs font-black opacity-30 uppercase tracking-[0.3em] ml-2">Configuration de la recherche</label>
          <div className="relative group">
            {mode === 'link' ? (
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Collez le lien jw.org ici..."
                className="w-full bg-black/20 border-2 border-white/10 rounded-[2rem] py-6 pl-16 pr-6 focus:outline-none focus:border-[var(--btn-color)] transition-all font-medium text-lg"
              />
            ) : (
              <input
                type="date"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-black/20 border-2 border-white/10 rounded-[2rem] py-6 px-8 focus:outline-none focus:border-[var(--btn-color)] transition-all font-medium text-lg appearance-none"
              />
            )}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
              {mode === 'link' ? <LinkIcon size={28} /> : <Calendar size={28} />}
            </div>
          </div>
        </div>

        {type === 'MINISTRY' && (
          <div className="space-y-4">
             <label className="text-xs font-black opacity-30 uppercase tracking-[0.3em] ml-2">Partie à préparer</label>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { id: 'tout', label: 'Tout préparer' },
                { id: 'joyaux', label: 'Joyaux' },
                { id: 'perles', label: 'Perles' },
                { id: 'ministere', label: 'Exposés' },
                { id: 'vie_chretienne', label: 'Vie Chrétienne' },
                { id: 'etude_biblique', label: 'Étude' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPart(p.id as StudyPart)}
                  style={{ 
                    backgroundColor: selectedPart === p.id ? 'var(--btn-color)' : 'rgba(255,255,255,0.03)',
                    color: selectedPart === p.id ? 'var(--btn-text)' : 'inherit'
                  }}
                  className={`py-4 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-white/20`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center space-x-4 text-red-400 animate-pulse">
            <RefreshCw size={24} />
            <p className="font-bold text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={() => handleGenerate()}
          disabled={loading || !input}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
          className={`w-full py-6 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center space-x-4 transition-all shadow-2xl active:scale-95 disabled:opacity-20`}
        >
          {loading ? <Loader2 className="animate-spin" size={28} /> : <ChevronRight size={28} />}
          <span>{loading ? "Recherche en cours..." : "Lancer l'Analyse"}</span>
        </button>
      </div>

      {preview && (
        <div className="bg-white/5 border border-white/10 rounded-[3.5rem] p-10 animate-in slide-in-from-bottom-10 duration-700 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--btn-color)] opacity-50" />
          <h3 className="text-3xl font-black mb-4">{preview.title}</h3>
          <p className="opacity-50 font-medium mb-10 leading-relaxed italic">L'IA a identifié l'article. Souhaitez-vous générer les réponses complètes ?</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleGenerate(true)}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
              className="flex-1 font-black py-5 rounded-2xl shadow-xl uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform"
            >
              Confirmer et Générer
            </button>
            <button 
              onClick={() => { setPreview(null); handleGenerate(false); }}
              className="flex-1 bg-white/5 font-black py-5 rounded-2xl border border-white/10 uppercase tracking-widest text-sm hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw size={18} />
              <span>Régénérer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTool;
