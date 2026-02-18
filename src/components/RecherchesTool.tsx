import React, { useState, useEffect } from 'react';
import { Search, Loader2, AlertTriangle, Info } from 'lucide-react';
import { AppSettings, GeneratedStudy } from '../types';
import { callSearchContentApi } from '../services/searchApiService'; // New service for this API
import { saveInputState, loadInputState } from '../utils/storage'; // Import for persistence


interface Props {
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const getLocalizedText = (settings: AppSettings, key: string) => {
  const texts: { [key: string]: { [lang: string]: string } } = {
    'searchPlaceholder': {
      'fr': 'Ex: Que dit la Bible sur l\'avenir de la terre ?',
      'en': 'Ex: What does the Bible say about the future of the earth?',
      'es': 'Ej: ¿Qué dice la Biblia sobre el futuro de la tierra?'
    },
    'enterQuery': {
      'fr': 'Veuillez entrer une question ou un sujet.',
      'en': 'Please enter a question or topic.',
      'es': 'Por favor, ingrese una pregunta o tema.'
    },
    'articleSearchInProgress': {
      'fr': 'Recherche d\'article pertinent sur JW.ORG...',
      'en': 'Searching for relevant article on JW.ORG...',
      'es': 'Buscando artículo relevante en JW.ORG...'
    },
    'noArticleFound': {
      'fr': 'Aucun article pertinent trouvé pour cette recherche.',
      'en': 'No relevant article found for this search.',
      'es': 'No se encontró ningún artículo relevante para esta búsqueda.'
    },
    'cannotConfirmArticle': {
      'fr': 'Impossible de confirmer l\'article.',
      'en': 'Cannot confirm article.',
      'es': 'No se puede confirmar el artículo.'
    },
    'analysisInProgress': {
      'fr': 'Analyse des résultats et génération de l\'explication...',
      'en': 'Analyzing results and generating explanation...',
      'es': 'Analizando resultados y generando explicación...'
    },
    'generationFailed': {
      'fr': 'Échec de la génération. Quotas Gemini?',
      'en': 'Generation failed. Gemini quotas?',
      'es': 'La generación falló. ¿Cuotas de Gemini?'
    },
    'searchArticle': {
      'fr': 'Chercher l\'article',
      'en': 'Search Article',
      'es': 'Buscar Artículo'
    },
    'articleFound': {
      'fr': 'Article trouvé',
      'en': 'Article Found',
      'es': 'Artículo encontrado'
    },
    'readyForAnalysis': {
      'fr': 'Prêt pour l\'analyse.',
      'en': 'Ready for analysis.',
      'es': 'Listo para el análisis.'
    },
    'changeSearch': {
      'fr': 'Changer la recherche',
      'en': 'Change Search',
      'es': 'Cambiar búsqueda'
    },
    'generateFullExplanation': {
      'fr': 'Générer l\'explication complète',
      'en': 'Generate full explanation',
      'es': 'Generar explicación completa'
    },
    'advancedSearch': {
      'fr': 'Recherches Avancées',
      'en': 'Advanced Searches',
      'es': 'Búsquedas avanzadas'
    },
  };
  return texts[key]?.[settings.language] || texts[key]?.['fr'];
};

const RecherchesTool: React.FC<Props> = ({ onGenerated, settings, setGlobalLoadingMessage }) => {
  const [query, setQuery] = useState(loadInputState('recherches-query', ''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleConfirmed, setArticleConfirmed] = useState<any>(null); // For preview

  // Persistence effect
  useEffect(() => { saveInputState('recherches-query', query); }, [query]);

  const handleInitialScan = async () => {
    if (!query.trim()) {
      setError(getLocalizedText(settings, 'enterQuery'));
      return;
    }
    setLoading(true);
    setError(null);
    setGlobalLoadingMessage(getLocalizedText(settings, 'articleSearchInProgress'));

    try {
      // Pass confirmMode: true to callSearchContentApi to get preview data
      const data = await callSearchContentApi(query, settings, true); 
      if (data.previewTitle) {
        setArticleConfirmed(data);
      } else {
        setError(getLocalizedText(settings, 'noArticleFound'));
      }
    } catch (err: any) {
      setError(err.message || getLocalizedText(settings, 'cannotConfirmArticle'));
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null);
    }
  };


  const handleGenerateContent = async () => {
    if (!query.trim() || !articleConfirmed) return;
    setLoading(true);
    setError(null);
    setGlobalLoadingMessage(getLocalizedText(settings, 'analysisInProgress'));

    try {
      // Call without confirmMode to get full structured content
      const data = await callSearchContentApi(query, settings, false); 
      
      const study: GeneratedStudy = {
        id: Date.now().toString(),
        type: 'RECHERCHES',
        title: query,
        date: new Date().toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : settings.language === 'es' ? 'es-ES' : 'en-US'),
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
      setError(err.message || getLocalizedText(settings, 'generationFailed'));
      setGlobalLoadingMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
          <Search className="text-[var(--btn-color)]" /> {getLocalizedText(settings, 'advancedSearch')}
        </h2>
        
        {!articleConfirmed ? (
          <>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={getLocalizedText(settings, 'searchPlaceholder')}
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
              <span>{getLocalizedText(settings, 'searchArticle')}</span>
            </button>
          </>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500 space-y-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center">
              {articleConfirmed.previewImage && <img src={articleConfirmed.previewImage} alt="Article" className="w-32 h-32 rounded-2xl object-cover shadow-xl" />}
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase text-[var(--btn-color)] tracking-widest">{getLocalizedText(settings, 'articleFound')}</span>
                <h3 className="text-2xl font-black mt-1 uppercase tracking-tight">{articleConfirmed.previewTitle}</h3>
                <p className="text-sm opacity-50 mt-2 italic">{articleConfirmed.previewSummary}</p>
              </div>
              <button onClick={() => setArticleConfirmed(null)} className="text-xs font-bold opacity-30 hover:opacity-100 uppercase underline">{getLocalizedText(settings, 'changeSearch')}</button>
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
              <span>{getLocalizedText(settings, 'generateFullExplanation')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecherchesTool;