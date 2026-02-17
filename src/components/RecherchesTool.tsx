import React, { useState } from 'react';
import { Search, Loader2, AlertTriangle, Info } from 'lucide-react';
import { AppSettings, GeneratedStudy } from '../types';

interface Props {
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const RecherchesTool: React.FC<Props> = ({ onGenerated, settings, setGlobalLoadingMessage }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setGlobalLoadingMessage("Recherche en cours sur JW.ORG...");

    try {
      const res = await fetch('/api/search-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionOrSubject: query, settings })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const study: GeneratedStudy = {
        id: Date.now().toString(),
        type: 'RECHERCHES',
        title: query,
        date: new Date().toLocaleDateString('fr-FR'),
        content: data.text,
        rawSources: data.rawSources,
        aiExplanation: data.aiExplanation,
        timestamp: Date.now(),
        category: 'recherches'
      };

      onGenerated(study);
    } catch (err: any) {
      setError(err.message);
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
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
          className="w-full py-5 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search />}
          <span>Lancer la recherche</span>
        </button>
      </div>
    </div>
  );
};

export default RecherchesTool;