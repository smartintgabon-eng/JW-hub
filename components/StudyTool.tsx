
import React, { useState } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { StudyPart, GeneratedStudy } from '../types';
import { generateStudyContent } from '../services/geminiService';

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
}

const StudyTool: React.FC<Props> = ({ type, onGenerated }) => {
  const [input, setInput] = useState('');
  const [selectedPart, setSelectedPart] = useState<StudyPart>('tout');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{title: string, content: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (isRetry = false) => {
    if (!input) return;
    setLoading(true);
    setError(null);
    try {
      const result = await generateStudyContent(type, input, selectedPart);
      if (!isRetry && type === 'WATCHTOWER' && !preview) {
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
      setError(err.message || "Une erreur s'est produite. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-5 mb-6">
        <div className={`p-4 rounded-[1.5rem] ${type === 'WATCHTOWER' ? 'bg-[#4a70b5]/20 text-[#4a70b5]' : 'bg-[#4a70b5]/20 text-[#4a70b5]'}`}>
          {type === 'WATCHTOWER' ? <Calendar size={32} /> : <Search size={32} />}
        </div>
        <div>
          <h2 className="text-3xl font-black text-white">{type === 'WATCHTOWER' ? 'Tour de Garde' : 'Vie et Ministère'}</h2>
          <p className="text-zinc-500 font-bold">Lien JW.ORG ou semaine d'étude.</p>
        </div>
      </div>

      <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl">
        <div className="space-y-3">
          <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Source JW.ORG</label>
          <div className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={type === 'WATCHTOWER' ? "Coller le lien de la Tour de Garde..." : "Coller le lien du Cahier..."}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-2xl py-5 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-[#4a70b5]/40 transition-all text-white font-medium group-hover:border-zinc-700"
            />
            <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-hover:text-[#4a70b5] transition-colors" size={24} />
          </div>
        </div>

        {type === 'MINISTRY' && (
          <div className="space-y-4">
            <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] ml-2">Partie à approfondir</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { id: 'tout', label: 'Tout' },
                { id: 'joyaux', label: 'Joyaux' },
                { id: 'perles', label: 'Perles' },
                { id: 'ministere', label: 'Ministère' },
                { id: 'vie_chretienne', label: 'Vie Chrétienne' },
                { id: 'etude_biblique', label: 'Étude Biblique' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPart(p.id as StudyPart)}
                  className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all border ${
                    selectedPart === p.id 
                    ? 'bg-[#4a70b5] border-[#4a70b5] text-white shadow-lg shadow-[#4a70b5]/20' 
                    : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-4 text-red-400">
            <AlertCircle size={24} className="shrink-0" />
            <span className="font-bold leading-relaxed">{error}</span>
          </div>
        )}

        <button
          onClick={() => handleGenerate()}
          disabled={loading || !input}
          className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-[0.2em] flex items-center justify-center space-x-3 transition-all ${
            loading || !input 
            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
            : 'bg-[#4a70b5] hover:bg-[#5a80c5] text-white shadow-xl shadow-[#4a70b5]/20 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={24} />
              <span>Analyse JW...</span>
            </>
          ) : (
            <>
              <Search size={24} />
              <span>Générer l'étude</span>
            </>
          )}
        </button>
      </div>

      {preview && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-500 shadow-2xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <span className="text-[10px] font-black text-[#4a70b5] uppercase tracking-[0.3em] bg-[#4a70b5]/10 px-3 py-1.5 rounded-full border border-[#4a70b5]/20">Aperçu Détecté</span>
              <h3 className="text-2xl font-black mt-4 text-white leading-tight">{preview.title}</h3>
            </div>
            <button onClick={() => setPreview(null)} className="p-2 text-zinc-500 hover:text-white transition-colors">
              <RefreshCw size={24} />
            </button>
          </div>
          <div className="bg-zinc-950 rounded-2xl p-6 mb-8 border border-zinc-800/50 max-h-48 overflow-hidden relative">
            <p className="text-zinc-500 font-medium leading-relaxed italic line-clamp-5">{preview.content}</p>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 to-transparent" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => handleGenerate(true)}
              className="flex-1 bg-[#4a70b5] hover:bg-[#5a80c5] text-white font-black py-4 rounded-xl transition-all flex items-center justify-center space-x-3 shadow-lg shadow-[#4a70b5]/20"
            >
              <Check size={20} />
              <span className="uppercase tracking-widest text-sm">Confirmer</span>
            </button>
            <button
              onClick={() => setPreview(null)}
              className="px-8 border border-zinc-700 hover:bg-zinc-800 text-zinc-400 font-black py-4 rounded-xl transition-all uppercase tracking-widest text-sm"
            >
              Modifier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTool;
