
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
    } catch (err) {
      setError("Une erreur s'est produite lors de la recherche sur jw.org. Vérifiez votre connexion ou le lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-6">
        <div className={`p-3 rounded-2xl ${type === 'WATCHTOWER' ? 'bg-indigo-600/20 text-indigo-400' : 'bg-blue-600/20 text-blue-400'}`}>
          {type === 'WATCHTOWER' ? <Calendar size={28} /> : <Search size={28} />}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Réunion Vie et Ministère'}</h2>
          <p className="text-zinc-500 text-sm">Entrez un lien jw.org ou décrivez la semaine d'étude.</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-400 ml-1">Lien de l'article ou Date (ex: "Semaine du 25 nov")</label>
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={type === 'WATCHTOWER' ? "Lien jw.org ou semaine..." : "Lien cahier ou semaine..."}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all text-zinc-200"
            />
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
          </div>
        </div>

        {type === 'MINISTRY' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-400 ml-1">Partie spécifique à générer</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'tout', label: 'Toutes les parties' },
                { id: 'joyaux', label: 'Joyaux' },
                { id: 'perles', label: 'Perles Spirituelles' },
                { id: 'ministere', label: 'Exposés Ministère' },
                { id: 'vie_chretienne', label: 'Vie Chrétienne' },
                { id: 'etude_biblique', label: 'Étude Biblique' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPart(p.id as StudyPart)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                    selectedPart === p.id 
                    ? 'bg-blue-600 border-blue-500 text-white' 
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
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start space-x-3 text-red-400 text-sm">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={() => handleGenerate()}
          disabled={loading || !input}
          className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${
            loading || !input 
            ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Recherche sur jw.org...</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Rechercher & Générer</span>
            </>
          )}
        </button>
      </div>

      {preview && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">Aperçu trouvé</span>
              <h3 className="text-xl font-bold mt-2 text-zinc-200">{preview.title}</h3>
            </div>
            <button onClick={() => setPreview(null)} className="text-zinc-500 hover:text-zinc-300">
              <RefreshCw size={20} />
            </button>
          </div>
          <div className="bg-zinc-950 rounded-2xl p-4 mb-6 border border-zinc-800 max-h-40 overflow-hidden relative">
            <p className="text-zinc-400 text-sm line-clamp-4 leading-relaxed italic">{preview.content.substring(0, 400)}...</p>
            <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-zinc-950 to-transparent" />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => handleGenerate(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2"
            >
              <Check size={18} />
              <span>Confirmer & Générer</span>
            </button>
            <button
              onClick={() => setPreview(null)}
              className="px-6 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold py-3 rounded-xl transition-all"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTool;
