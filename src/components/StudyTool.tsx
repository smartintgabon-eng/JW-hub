import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Globe, Check, ShieldCheck, AlertTriangle, Plus, Minus, Type, Info } from 'lucide-react'; 
import { StudyPart, GeneratedStudy, AppSettings } from '../types.ts'; 
import { saveInputState, loadInputState } from '../utils/storage.ts'; // Import for persistence

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void; 
}

const getLocalizedText = (settings: AppSettings, key: string) => {
  const texts: { [key: string]: { [lang: string]: string } } = {
    'mainLinkPlaceholder': {
      'fr': 'https://www.jw.org/fr/...',
      'en': 'https://www.jw.org/en/...',
      'es': 'https://www.jw.org/es/...'
    },
    'extraLinkPlaceholder': {
      'fr': 'Lien secondaire (ex: pour l\'étude de livre)...',
      'en': 'Secondary link (e.g., for book study)...',
      'es': 'Enlace secundario (ej. para estudio de libro)...'
    },
    'manualTextPlaceholderWatchtower': {
      'fr': 'Collez ici le texte intégral de l\'article de la Tour de Garde (copié directement depuis jw.org). L\'IA utilisera cette source en priorité.',
      'en': 'Paste here the full Watchtower article text (copied directly from jw.org). AI will prioritize this source.',
      'es': 'Pegue aquí el texto completo del artículo de La Atalaya (copiado directamente de jw.org). La IA priorizará esta fuente.'
    },
    'manualTextPlaceholderMinistry': {
      'fr': 'Collez ici le texte intégral de l\'article du Cahier (copié directement depuis jw.org). L\'IA utilisera cette source en priorité.',
      'en': 'Paste here the full Ministry Workbook article text (copied directly from jw.org). AI will prioritize this source.',
      'es': 'Pegue aquí el texto completo del artículo del Cuaderno (copiado directamente de jw.org). La IA priorizará esta fuente.'
    },
    'provideLinkOrText': {
      'fr': 'Veuillez fournir un lien ou du texte manuel.',
      'en': 'Please provide a link or manual text.',
      'es': 'Por favor, proporcione un enlace o texto manual.'
    },
    'articleAnalysisInProgress': {
      'fr': 'Analyse de l\'article en cours...',
      'en': 'Article analysis in progress...',
      'es': 'Análisis del artículo en curso...'
    },
    'articleConfirmationError': {
      'fr': 'Erreur de confirmation de l\'article.',
      'en': 'Article confirmation error.',
      'es': 'Error de confirmación del artículo.'
    },
    'cannotAccessArticle': {
      'fr': 'Impossible d\'accéder à l\'article. Essayez la saisie manuelle.',
      'en': 'Cannot access article. Try manual input.',
      'es': 'No se puede acceder al artículo. Intente la entrada manual.'
    },
    'generationInProgress': {
      'fr': 'Génération : ',
      'en': 'Generating: ',
      'es': 'Generando: '
    },
    'generationError': {
      'fr': 'Erreur lors de la génération.',
      'en': 'Error during generation.',
      'es': 'Error durante la generación.'
    },
    'generationFailed': {
      'fr': 'Échec de la génération. Quotas Gemini?',
      'en': 'Generation failed. Gemini quotas?',
      'es': 'La generación falló. ¿Cuotas de Gemini?'
    },
    'confirmArticle': {
      'fr': 'Confirmer l\'article',
      'en': 'Confirm Article',
      'es': 'Confirmar Artículo'
    },
    'articleIdentified': {
      'fr': 'Article identifié',
      'en': 'Article Identified',
      'es': 'Artículo identificado'
    },
    'readyForAnalysis': {
      'fr': 'Prêt pour l\'analyse.',
      'en': 'Ready for analysis.',
      'es': 'Listo para el análisis.'
    },
    'change': {
      'fr': 'Changer',
      'en': 'Change',
      'es': 'Cambiar'
    },
    'launchFullAnalysis': {
      'fr': 'Lancer l\'analyse complète',
      'en': 'Launch full analysis',
      'es': 'Iniciar análisis completo'
    },
    'mainLinkLabel': {
      'fr': 'Lien Principal (Semaine / Étude)',
      'en': 'Main Link (Week / Study)',
      'es': 'Enlace Principal (Semana / Estudio)'
    },
    'extraLinksLabel': {
      'fr': 'Liens Références Étude de livre (Optionnel)',
      'en': 'Book Study Reference Links (Optional)',
      'es': 'Enlaces de referencia del estudio bíblico (Opcional)'
    },
    'jwLink': {
      'fr': 'Lien jw.org',
      'en': 'jw.org Link',
      'es': 'Enlace jw.org'
    },
    'manualInput': {
      'fr': 'Saisie Manuelle',
      'en': 'Manual Input',
      'es': 'Entrada Manual'
    },
    'infosKeys': { 'fr': 'Infos clés :', 'en': 'Key info:', 'es': 'Información clave:' } // New key for preview infos
  };
  return texts[key]?.[settings.language] || texts[key]?.['fr'];
};


const StudyTool: React.FC<Props> = ({ type, onGenerated, settings, setGlobalLoadingMessage }) => {
  const [mainLink, setMainLink] = useState('');
  const [extraLinks, setExtraLinks] = useState<string[]>([]);
  const [manualText, setManualText] = useState('');
  // Set useManual default based on type: true for WATCHTOWER, false for MINISTRY
  const [useManual, setUseManual] = useState(type === 'WATCHTOWER');
  const [loading, setLoading] = useState(false);
  const [articleConfirmed, setArticleConfirmed] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedMainLink = localStorage.getItem(`${type}-mainLink`);
    if (savedMainLink) setMainLink(savedMainLink);
    const savedExtraLinks = localStorage.getItem(`${type}-extraLinks`);
    if (savedExtraLinks) setExtraLinks(JSON.parse(savedExtraLinks));
    const savedManualText = localStorage.getItem(`${type}-manualText`);
    if (savedManualText) setManualText(savedManualText);
    const savedUseManual = localStorage.getItem(`${type}-useManual`);
    if (savedUseManual) setUseManual(JSON.parse(savedUseManual));
  }, [type]);

  useEffect(() => { localStorage.setItem(`${type}-mainLink`, mainLink); }, [mainLink, type]);
  useEffect(() => { localStorage.setItem(`${type}-extraLinks`, JSON.stringify(extraLinks)); }, [extraLinks, type]);
  useEffect(() => { localStorage.setItem(`${type}-manualText`, manualText); }, [manualText, type]);
  useEffect(() => { localStorage.setItem(`${type}-useManual`, JSON.stringify(useManual)); }, [useManual, type]);

  const addExtraLink = () => {
    if (extraLinks.length < 5) { // Limit extra links for sanity
      setExtraLinks([...extraLinks, '']);
    }
  };
  const removeExtraLink = (idx: number) => setExtraLinks(extraLinks.filter((_, i) => i !== idx));
  const updateExtraLink = (idx: number, val: string) => {
    const next = [...extraLinks];
    next[idx] = val;
    setExtraLinks(next);
  };

  const handleInitialScan = async () => {
    if ((!mainLink && !useManual) || (useManual && !manualText)) {
      setError(getLocalizedText(settings, 'provideLinkOrText'));
      return;
    }
    setLoading(true);
    setError(null);
    setGlobalLoadingMessage(getLocalizedText(settings, 'articleAnalysisInProgress'));

    try {
      // Manual mode skips confirmation for simplicity or uses Gemini to summarize
      if (useManual) {
        // For manual text, we simulate a confirmation by just showing the type and a generic summary.
        setArticleConfirmed({ 
          previewTitle: `${getLocalizedText(settings, 'manualInput')} (${type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier'})`, 
          previewSummary: `${getLocalizedText(settings, 'readyForAnalysis')}`,
          previewImage: null, // No image for manual text
          previewInfos: '' // No infos for manual text
        });
      } else {
        const res = await fetch('/api/search-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionOrSubject: mainLink, settings, confirmMode: true })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || getLocalizedText(settings, 'articleConfirmationError'));
        setArticleConfirmed(data);
      }
    } catch (err: any) {
      setError(err.message || getLocalizedText(settings, 'cannotAccessArticle'));
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null);
    }
  };

  const startGeneration = async (part: StudyPart | 'tout') => {
    setLoading(true);
    setGlobalLoadingMessage(`${getLocalizedText(settings, 'generationInProgress')} ${part.replace(/_/g, ' ')}...`);
    
    try {
      // Combine mainLink and extraLinks if not in manual mode
      const combinedInput = !useManual ? (mainLink + (extraLinks.length ? "\n" + extraLinks.join("\n") : "")) : "";
      
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, input: combinedInput, part, settings, manualText: useManual ? manualText : null })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || getLocalizedText(settings, 'generationError'));

      onGenerated({
        id: Date.now().toString(),
        type,
        title: data.title,
        date: new Date().toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : settings.language === 'es' ? 'es-ES' : 'en-US'),
        content: data.text,
        timestamp: Date.now(),
        part: part === 'tout' ? undefined : (part as StudyPart),
        category: type === 'WATCHTOWER' ? 'tour_de_garde' : 'cahier_vie_et_ministere',
        url: useManual ? getLocalizedText(settings, 'manualInput') : mainLink + (extraLinks.length ? ", " + extraLinks.join(", ") : "")
      });
      // Reset after successful generation
      setMainLink('');
      setExtraLinks([]);
      setManualText('');
      setUseManual(type === 'WATCHTOWER'); // Reset useManual to default for the type
      setArticleConfirmed(null);
    } catch (err: any) {
      setError(err.message || getLocalizedText(settings, 'generationFailed'));
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null);
    }
  };

  const ministryOptions = [
    { id: 'joyaux_parole_dieu', label: (settings.language === 'fr' ? 'JOYAUX' : settings.language === 'es' ? 'JOYAS' : 'TREASURES'), desc: (settings.language === 'fr' ? 'Discours complet' : settings.language === 'es' ? 'Discurso completo' : 'Full talk') },
    { id: 'perles_spirituelles', label: (settings.language === 'fr' ? 'PERLES' : settings.language === 'es' ? 'PERLAS' : 'GEMS'), desc: (settings.language === 'fr' ? 'Recherche biblique' : settings.language === 'es' ? 'Búsqueda bíblica' : 'Bible research') },
    { id: 'applique_ministere', label: (settings.language === 'fr' ? 'APPLIQUE-TOI' : settings.language === 'es' ? 'APLICARSE' : 'APPLY YOURSELF'), desc: (settings.language === 'fr' ? 'Choix de l\'exposé' : settings.language === 'es' ? 'Elección de la presentación' : 'Choose presentation') },
    { id: 'vie_chretienne', label: (settings.language === 'fr' ? 'VIE CHRÉTIENNE' : settings.language === 'es' ? 'VIDA CRISTIANA' : 'CHRISTIAN LIFE'), desc: (settings.language === 'fr' ? 'Analyse vidéo/article' : settings.language === 'es' ? 'Análisis de video/artículo' : 'Video/article analysis') },
    { id: 'etude_biblique_assemblee', label: (settings.language === 'fr' ? 'ÉTUDE DE LIVRE' : settings.language === 'es' ? 'ESTUDIO DE LIBRO' : 'BOOK STUDY'), desc: (settings.language === 'fr' ? 'Réponses + 5 leçons' : settings.language === 'es' ? 'Respuestas + 5 lecciones' : 'Answers + 5 lessons') },
    { id: 'tout', label: (settings.language === 'fr' ? 'TOUT L\'ARTICLE' : settings.language === 'es' ? 'ARTÍCULO COMPLETO' : 'FULL ARTICLE'), desc: (settings.language === 'fr' ? 'Génération complète' : settings.language === 'es' ? 'Generación completa' : 'Full generation') },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-4">
          <div className="p-3 bg-[var(--btn-color)] rounded-2xl"><Calendar size={28} /></div>
          {type === 'WATCHTOWER' ? (settings.language === 'fr' ? 'Tour de Garde' : settings.language === 'es' ? 'La Atalaya' : 'Watchtower') : (settings.language === 'fr' ? 'Cahier de Réunion' : settings.language === 'es' ? 'Cuaderno de Reuniones' : 'Meeting Workbook')}
        </h2>

        {!articleConfirmed ? (
          <div className="space-y-6">
            <div className="flex bg-white/5 p-1 rounded-xl w-fit mb-6">
              <button onClick={() => setUseManual(false)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${!useManual ? 'bg-white/10 shadow' : 'opacity-40'}`}>{getLocalizedText(settings, 'jwLink')}</button>
              <button onClick={() => setUseManual(true)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${useManual ? 'bg-white/10 shadow' : 'opacity-40'}`}>{getLocalizedText(settings, 'manualInput')}</button>
            </div>

            {useManual ? (
              <textarea 
                value={manualText} 
                onChange={e => {
                  setManualText(e.target.value);
                  localStorage.setItem(`${type}-manualText`, e.target.value);
                }}
                placeholder={type === 'WATCHTOWER' ? getLocalizedText(settings, 'manualTextPlaceholderWatchtower') : getLocalizedText(settings, 'manualTextPlaceholderMinistry')}
                className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)] transition-all resize-none"
              />
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'mainLinkLabel')}</label>
                  <div className="relative mt-2">
                    <input type="text" value={mainLink} onChange={e => {
                  setMainLink(e.target.value);
                  localStorage.setItem(`${type}-mainLink`, e.target.value);
                }} placeholder={getLocalizedText(settings, 'mainLinkPlaceholder')} className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none" />
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                  </div>
                </div>

                {type === 'MINISTRY' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">{getLocalizedText(settings, 'extraLinksLabel')}</label>
                      <button onClick={addExtraLink} className="p-2 bg-[var(--btn-color)]/20 text-[var(--btn-color)] rounded-lg hover:bg-[var(--btn-color)]/30"><Plus size={16}/></button>
                    </div>
                    <div className="space-y-3">
                      {extraLinks.map((link, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={link} onChange={e => updateExtraLink(i, e.target.value)} placeholder={getLocalizedText(settings, 'extraLinkPlaceholder')} className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-[var(--btn-color)] outline-none text-sm" />
                          <button onClick={() => removeExtraLink(i)} className="p-3 text-red-400 bg-red-400/10 rounded-xl"><Minus size={16}/></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && <div className="p-4 bg-red-400/10 text-red-400 rounded-xl text-xs font-bold">{error}</div>}

            <button
              onClick={handleInitialScan}
              disabled={loading || ((!mainLink && !useManual) || (useManual && !manualText))}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
              className="w-full py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Search />}
              {getLocalizedText(settings, 'confirmArticle')}
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500 space-y-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center">
              {articleConfirmed.previewImage && <img src={articleConfirmed.previewImage} alt="Article" className="w-32 h-32 rounded-2xl object-cover shadow-xl" />}
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase text-[var(--btn-color)] tracking-widest">{getLocalizedText(settings, 'articleIdentified')}</span>
                <h3 className="text-2xl font-black mt-1 uppercase tracking-tight">{articleConfirmed.previewTitle || articleConfirmed.title}</h3>
                <p className="text-sm opacity-50 mt-2 italic">{articleConfirmed.previewSummary || getLocalizedText(settings, 'readyForAnalysis')}</p>
                {articleConfirmed.previewInfos && (
                  <p className="text-xs opacity-40 mt-2 flex items-center gap-2">
                    <Info size={14} className="text-[var(--btn-color)]" /> {getLocalizedText(settings, 'infosKeys')} {articleConfirmed.previewInfos}
                  </p>
                )}
              </div>
              <button onClick={() => setArticleConfirmed(null)} className="text-xs font-bold opacity-30 hover:opacity-100 uppercase underline">{getLocalizedText(settings, 'change')}</button>
            </div>

            {type === 'MINISTRY' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ministryOptions.map(opt => (
                  <button 
                    key={opt.id} 
                    onClick={() => startGeneration(opt.id as StudyPart)}
                    className="p-6 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 hover:border-[var(--btn-color)] transition-all group"
                  >
                    <h4 className="font-black uppercase text-sm group-hover:text-[var(--btn-color)]">{opt.label}</h4>
                    <p className="text-[10px] opacity-40 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => startGeneration('tout')}
                style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-8 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center justify-center gap-4 active:scale-95"
              >
                <ShieldCheck size={32} />
                {getLocalizedText(settings, 'launchFullAnalysis')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTool;