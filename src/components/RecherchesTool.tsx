import React, { useState } from 'react';
import { Search, Loader2, AlertTriangle, Info } from 'lucide-react';
import { AppSettings, GeneratedStudy } from '../types';
import { callSearchContentApi } from '../services/searchApiService'; // New service for this API

interface Props {
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const RecherchesTool: React.FC<Props> = ({ onGenerated, settings, setGlobalLoadingMessage }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleConfirmed, setArticleConfirmed] = useState<any>(null); // For preview

  const handleInitialScan = async () => {
    if (!query.trim()) {
      setError("Veuillez entrer une question ou un sujet.");
      return;
    }
    setLoading(true);
    setError(null);
    setGlobalLoadingMessage("Recherche d'article pertinent sur JW.ORG...");

    try {
      // Pass confirmMode: true to callSearchContentApi to get preview data
      const data = await callSearchContentApi(query, settings, true); 
      if (data.previewTitle) {
        setArticleConfirmed(data);
      } else {
        setError("Aucun article pertinent trouvé pour cette recherche.");
      }
    } catch (err: any) {
      setError(err.message || "Impossible de confirmer l'article.");
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null);
    }
  };


  const handleGenerateContent = async () => {
    if (!query.trim() || !articleConfirmed) return;
    setLoading(true);
    setError(null);
    setGlobalLoadingMessage("Analyse des résultats et génération de l'explication...");

    try {
      // Call without confirmMode to get full structured content
      const data = await callSearchContentApi(query, settings, false); 
      
      const study: GeneratedStudy = {
        id: Date.now().toString(),
        type: 'RECHERCHES',
        title: query,
        date: new Date().toLocaleDateString('fr-FR'),
        content: data.text, // Use data.text which contains the structured NOM, LIEN, EXPLICATION
        rawSources: [], // The raw sources are now embedded in data.text, so this can be empty or parsed from data.text if needed
        aiExplanation: data.text, // aiExplanation can also point to the full structured text
        timestamp: Date.now(),
        category: 'recherches',
        url: query // Store the search query as URL
      };

      onGenerated(study); // This will also navigate to history and clear loading message
      setQuery(''); // Clear input after successful search
      setArticleConfirmed(null); // Reset confirmation
    } catch (err: any) {
      setError(err.message || "Échec de la génération. Quotas Gemini?");
      setGlobalLoadingMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
          <Search className="text-[var(--btn-color)]" /> Recherches Avancées
        </h2>
        
        {!articleConfirmed ? (
          <>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Que dit la Bible sur l'avenir de la terre ?"
              className="w-full h-32 bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)] transition-all resize-none mb-4"
            />

            {error && (
              <div className="p-4 bg-red-500/10 text-red-400 rounded-xl mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              onClick={handleInitialScan}
              disabled={loading || !query.trim()}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
              className="w-full py-5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
              <span>Chercher l'article</span>
            </button>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500 space-y-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center">
              {articleConfirmed.previewImage && <img src={articleConfirmed.previewImage} alt="Article" className="w-32 h-32 rounded-2xl object-cover shadow-xl" />}
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase text-[var(--btn-color)] tracking-widest">Article trouvé</span>
                <h3 className="text-2xl font-black mt-1 uppercase tracking-tight">{articleConfirmed.previewTitle}</h3>
                <p className="text-sm opacity-50 mt-2 italic">{articleConfirmed.previewSummary}</p>
              </div>
              <button onClick={() => setArticleConfirmed(null)} className="text-xs font-bold opacity-30 hover:opacity-100 uppercase underline">Changer la recherche</button>
            </div>
            {error && (
              <div className="p-4 bg-red-500/10 text-red-400 rounded-xl mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> <span className="text-sm">{error}</span>
              </div>
            )}
            <button
              onClick={handleGenerateContent}
              disabled={loading}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
              className="w-full py-8 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Info size={32} />}
              <span>Générer l'explication complète</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecherchesTool;