import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertTriangle, Timer, BookOpen, Link as LinkIcon, Info } from 'lucide-react';
import { AppSettings, GeneratedStudy } from '../types';
import { callSearchContentApi } from '../services/searchApiService'; // New service for this API

interface Props {
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const RecherchesTool: React.FC<Props> = ({ onGenerated, settings, setGlobalLoadingMessage }) => {
  const [questionOrSubject, setQuestionOrSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSearch = async () => {
    if (loading || cooldown > 0 || !questionOrSubject.trim()) return;

    setLoading(true);
    setGlobalLoadingMessage('Lancement des recherches avancées...');
    setError(null);

    try {
      const result = await callSearchContentApi(questionOrSubject, settings);
      
      setGlobalLoadingMessage('Analyse des résultats et génération de l\'explication...');
      const newStudy: GeneratedStudy = {
        id: Date.now().toString(),
        type: 'RECHERCHES',
        title: questionOrSubject,
        date: new Date().toLocaleDateString('fr-FR'),
        content: result.aiExplanation, // The AI explanation is the main content for display
        rawSources: result.rawSources,
        aiExplanation: result.aiExplanation,
        timestamp: Date.now(),
        category: 'recherches',
        url: questionOrSubject // Store the search query as URL
      };
      onGenerated(newStudy); // This will also navigate to history and clear loading message
      setQuestionOrSubject(''); // Clear input after successful search
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    setGlobalLoadingMessage(null);
    setError(err.message || "Une erreur inconnue est survenue.");
    
    if (err.message && err.message.includes('patienter')) {
      const match = err.message.match(/patienter (\d+)s/);
      if (match && match[1]) {
        setCooldown(parseInt(match[1]));
      } else {
        setCooldown(90);
      }
    }
  };

  const isSearchDisabled = loading || cooldown > 0 || !questionOrSubject.trim();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:max-w-5xl md:mx-auto">
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-xl">
          <Search size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Recherches Avancées</h2>
          <p className="opacity-40 text-sm font-bold tracking-wide">Trouvez des réponses détaillées sur jw.org et wol.jw.org.</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl relative">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]">Votre question ou sujet de recherche</label>
          <div className="relative">
            <textarea
              value={questionOrSubject}
              disabled={loading || cooldown > 0}
              onChange={(e) => setQuestionOrSubject(e.target.value)}
              placeholder="Ex: Que dit la Bible sur l'espérance du Paradis terrestre ?"
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium resize-none"
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">
              <BookOpen size={22} />
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 opacity-40 text-[11px] italic pt-2">
            <Info size={14} className="mt-0.5 flex-shrink-0" />
            <span>L'IA fouillera spécifiquement les sites jw.org et wol.jw.org pour des réponses fiables.</span>
        </div>

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in fade-in zoom-in duration-300">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                 <p className="uppercase text-xs font-black tracking-widest">Alerte de Quota</p>
                 <p className="font-normal opacity-90 leading-relaxed">
                   {cooldown > 0 
                    ? `Google limite l'utilisation gratuite. Veuillez patienter ${cooldown} secondes. Les tentatives répétées prolongeront ce délai.`
                    : error}
                 </p>
              </div>
            </div>
            
            {cooldown > 0 ? (
              <div className="flex items-center justify-center space-x-3 bg-red-500/20 py-4 rounded-xl border border-red-500/30">
                <Timer className="animate-pulse" size={20} />
                <span className="font-mono text-xl">00:{cooldown < 10 ? `0${cooldown}` : cooldown}</span>
              </div>
            ) : (
              <button onClick={() => setQuestionOrSubject('')} className="w-full text-[10px] font-black uppercase tracking-widest bg-white/10 py-3 rounded-xl hover:bg-white/20 transition-all">
                Réinitialiser la recherche
              </button>
            )}
          </div>
        )}

        <button
          onClick={handleSearch}
          disabled={isSearchDisabled}
          style={{ backgroundColor: isSearchDisabled && cooldown > 0 ? '#1f2937' : 'var(--btn-color)', color: 'var(--btn-text)' }}
          className="w-full py-6 rounded-xl font-black uppercase tracking-widest flex flex-col items-center justify-center space-y-1 shadow-2xl active:scale-95 disabled:opacity-50 transition-all min-h-[100px]"
        >
          {loading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="animate-spin" size={28} />
              <span className="text-[10px] opacity-70 font-bold tracking-widest uppercase">Lancement des recherches...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Search size={24} />
              <span className="text-xl">Rechercher</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default RecherchesTool;