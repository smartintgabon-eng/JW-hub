import React, { useState, useEffect } from 'react';
import { Megaphone, Loader2, Check, AlertTriangle, Timer, BookOpen, Search, Link as LinkIcon, Handshake, CornerRightDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { AppSettings, GeneratedStudy, PredicationType } from '../types';
import { generateStudyContent } from '../services/geminiService';

interface Props {
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const PredicationTool: React.FC<Props> = ({ onGenerated, settings, setGlobalLoadingMessage }) => {
  const [predicationMode, setPredicationMode] = useState<PredicationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Porte-en-porte states
  const [pepPublicationLink, setPepPublicationLink] = useState('');
  const [pepTopic, setPepTopic] = useState('');
  const [pepOfferStudy, setPepOfferStudy] = useState(false);
  const [pepStudyBrochureLink, setPepStudyBrochureLink] = useState('');
  const [pepCurrentAffairs, setPepCurrentAffairs] = useState('');
  const [pepStep, setPepStep] = useState(1); // 1: Initial inputs, 2: Context/Generate

  // Nouvelle Visite states
  const [nvType, setNvType] = useState<'study' | 'question' | null>(null);
  const [nvStudyLink, setNvStudyLink] = useState('');
  const [nvStudyChapterParagraph, setNvStudyChapterParagraph] = useState('');
  const [nvQuestionLeft, setNvQuestionLeft] = useState('');
  const [nvBrochureLink, setNvBrochureLink] = useState('');

  // Cours Biblique states
  const [cbType, setCbType] = useState<'new' | 'ongoing' | null>(null);
  const [cbChapterParagraph, setCbChapterParagraph] = useState('');
  const [cbPublicationLink, setCbPublicationLink] = useState('');

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const resetAllStates = () => {
    setPredicationMode(null);
    setLoading(false);
    setError(null);
    setCooldown(0);
    setGlobalLoadingMessage(null);

    // Reset Porte-en-porte
    setPepPublicationLink('');
    setPepTopic('');
    setPepOfferStudy(false);
    setPepStudyBrochureLink('');
    setPepCurrentAffairs('');
    setPepStep(1);

    // Reset Nouvelle Visite
    setNvType(null);
    setNvStudyLink('');
    setNvStudyChapterParagraph('');
    setNvQuestionLeft('');
    setNvBrochureLink('');

    // Reset Cours Biblique
    setCbType(null);
    setCbChapterParagraph('');
    setCbPublicationLink('');
  };

  const handleGenerateContent = async (
    title: string,
    inputDetails: string,
    preachingType: PredicationType
  ) => {
    if (loading || cooldown > 0) return;

    setLoading(true);
    setGlobalLoadingMessage('Génération de la préparation de prédication...');
    setError(null);

    try {
      const result = await generateStudyContent('PREDICATION', inputDetails, 'tout', settings, 0, false, preachingType);

      setGlobalLoadingMessage('Enregistrement de la préparation et redirection...');
      const newStudy: GeneratedStudy = {
        id: Date.now().toString(),
        type: 'PREDICATION',
        title: result.title,
        date: new Date().toLocaleDateString('fr-FR'),
        content: result.text,
        timestamp: Date.now(),
        url: pepPublicationLink || nvStudyLink || cbPublicationLink, // Use appropriate link
        preachingType: preachingType,
        // Fix: Added the 'category' property to satisfy the GeneratedStudy interface.
        category: `predication_${preachingType}`
      };
      onGenerated(newStudy);
      resetAllStates();
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    const errorStr = JSON.stringify(err);
    const status = err.status || (err.response && err.response.status);

    setGlobalLoadingMessage(null);

    if (err.message === 'COOLDOWN_REQUIRED') {
      setError("Limite globale des requêtes Google atteinte. Veuillez patienter.");
      setCooldown(90);
    } else if (err.message === 'SEARCH_QUOTA_EXCEEDED') {
      setError("Le service de recherche Google est temporairement saturé. Veuillez réessayer plus tard.");
      setCooldown(60);
    } else if (err.message === 'INVALID_API_KEY') {
      setError("Clé API invalide. Vérifiez votre configuration.");
    } else if (err.message === 'BILLING_REQUIRED') {
      setError("La recherche nécessite une configuration de facturation active sur Google Cloud.");
    } else if (err.message.startsWith('GENERIC_API_ERROR')) {
      setError(`Une erreur de communication est survenue avec l'API Gemini (${err.message.split(': ')[1]}).`);
    } else if (err.message === "MODEL_PROCESSING_ERROR") {
      setError("L'IA n'a pas pu générer la préparation. Essayez avec une autre formulation ou un lien différent.");
    } else {
      setError("Connexion interrompue ou erreur inconnue. Veuillez vérifier votre connexion ou réessayer.");
    }
  };

  const getCommonFormStyles = () => "w-full bg-black/40 border border-white/10 rounded-xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium";
  const getCommonLabelStyles = () => "text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]";
  const getCommonButtonStyles = (isActive: boolean) => `px-4 py-2 rounded-lg text-sm font-bold transition-all ${isActive ? 'bg-[var(--btn-color)] text-[var(--btn-text)] shadow' : 'bg-white/5 opacity-60 hover:opacity-100'}`;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-xl">
          <Megaphone size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Préparation à la Prédication</h2>
          <p className="opacity-40 text-sm font-bold tracking-wide">Préparez vos présentations efficacement.</p>
        </div>
      </div>

      {!predicationMode && (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl relative">
          <p className="text-lg opacity-80 font-medium text-center">Choisissez le type de préparation de prédication :</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button onClick={() => setPredicationMode('porte_en_porte')} className="p-8 bg-white/10 rounded-3xl hover:bg-white/20 transition-all text-center space-y-3">
              <BookOpen size={32} className="mx-auto text-[var(--btn-color)]" />
              <span className="font-bold text-xl uppercase tracking-tight">Porte-en-porte</span>
            </button>
            <button onClick={() => setPredicationMode('nouvelle_visite')} className="p-8 bg-white/10 rounded-3xl hover:bg-white/20 transition-all text-center space-y-3">
              <Handshake size={32} className="mx-auto text-[var(--btn-color)]" />
              <span className="font-bold text-xl uppercase tracking-tight">Nouvelle Visite</span>
            </button>
            <button onClick={() => setPredicationMode('cours_biblique')} className="p-8 bg-white/10 rounded-3xl hover:bg-white/20 transition-all text-center space-y-3">
              <CornerRightDown size={32} className="mx-auto text-[var(--btn-color)]" />
              <span className="font-bold text-xl uppercase tracking-tight">Cours Biblique</span>
            </button>
          </div>
        </div>
      )}

      {predicationMode === 'porte_en_porte' && (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl relative">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6" style={{ color: 'var(--btn-color)' }}>Porte-en-porte</h3>

          {pepStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <label className={getCommonLabelStyles()}>Lien direct de la publication souhaitée (jw.org)</label>
                <div className="relative">
                  <input type="text" value={pepPublicationLink} onChange={(e) => setPepPublicationLink(e.target.value)}
                    placeholder="https://www.jw.org/fr/..." className={getCommonFormStyles()} />
                  <LinkIcon size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                </div>
              </div>
              <div className="space-y-3">
                <label className={getCommonLabelStyles()}>Sujet en particulier (Ex: L'espoir pour l'avenir)</label>
                <div className="relative">
                  <input type="text" value={pepTopic} onChange={(e) => setPepTopic(e.target.value)}
                    placeholder="Votre sujet principal" className={getCommonFormStyles()} />
                  <BookOpen size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                </div>
              </div>
              <div className="flex items-center space-x-3 bg-black/20 p-4 rounded-xl border border-white/10">
                <input type="checkbox" checked={pepOfferStudy} onChange={(e) => setPepOfferStudy(e.target.checked)}
                  className="w-5 h-5 rounded-md text-[var(--btn-color)] bg-white/10 border-white/20 focus:ring-[var(--btn-color)]" />
                <label className="text-sm font-medium">Souhaitez-vous proposer un cours biblique ?</label>
              </div>
              {pepOfferStudy && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <label className={getCommonLabelStyles()}>Lien de la brochure 'Vivez pour toujours' (leçon 1)</label>
                  <div className="relative">
                    <input type="text" value={pepStudyBrochureLink} onChange={(e) => setPepStudyBrochureLink(e.target.value)}
                      placeholder="https://www.jw.org/fr/publications/livres/vivez-pour-toujours-livre-de-base-du-cours-biblique/lecon-1/" className={getCommonFormStyles()} />
                    <LinkIcon size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                  </div>
                </div>
              )}
              {/* Fix: Added ChevronRight import at the top of the file */}
              <button onClick={() => setPepStep(2)} disabled={!pepPublicationLink.trim() || !pepTopic.trim()}
                style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-5 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                Suivant <ChevronRight size={20} />
              </button>
            </div>
          )}

          {pepStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Fix: Added ChevronLeft import at the top of the file */}
              <button onClick={() => setPepStep(1)} className="flex items-center space-x-2 opacity-60 hover:opacity-100 mb-6">
                <ChevronLeft size={20} /> <span className="text-sm">Retour</span>
              </button>
              <p className="text-lg opacity-80 font-medium text-center">Fournissez un contexte ou générez directement :</p>
              <div className="space-y-3">
                <label className={getCommonLabelStyles()}>Conditions d'actualités pour détailler le sujet (facultatif)</label>
                <textarea value={pepCurrentAffairs} onChange={(e) => setPepCurrentAffairs(e.target.value)}
                  placeholder="Ex: L'actualité récente sur les catastrophes naturelles montre le besoin d'espoir."
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium resize-none" />
              </div>

              <button onClick={() => handleGenerateContent(
                  `Prédication Porte-à-porte: ${pepTopic}`,
                  `Publication: ${pepPublicationLink}, Sujet: ${pepTopic}${pepOfferStudy ? `, Offre étude: ${pepStudyBrochureLink}` : ''}${pepCurrentAffairs ? `, Actualités: ${pepCurrentAffairs}` : ''}`,
                  'porte_en_porte'
                )}
                style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-5 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />}
                <span>Générer la préparation</span>
              </button>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 bg-red-500/10 text-red-400 rounded-lg flex items-center space-x-2">
              <AlertTriangle size={20} /> <p className="text-sm">{cooldown > 0 ? `Veuillez patienter ${cooldown}s.` : error}</p>
            </div>
          )}
          <button onClick={resetAllStates} className="mt-8 w-full bg-white/5 border border-white/10 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
            Annuler / Recommencer
          </button>
        </div>
      )}

      {predicationMode === 'nouvelle_visite' && (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl relative">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6" style={{ color: 'var(--btn-color)' }}>Nouvelle Visite</h3>

          <div className="space-y-3">
            <label className={getCommonLabelStyles()}>Type de nouvelle visite</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setNvType('study')} className={getCommonButtonStyles(nvType === 'study')}>Enchaîner Cours Biblique</button>
              <button onClick={() => setNvType('question')} className={getCommonButtonStyles(nvType === 'question')}>Question en suspens</button>
            </div>
          </div>

          {nvType === 'study' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <label className={getCommonLabelStyles()}>Lien direct de l'article/publication (jw.org)</label>
                <div className="relative">
                  <input type="text" value={nvStudyLink} onChange={(e) => setNvStudyLink(e.target.value)}
                    placeholder="https://www.jw.org/fr/publications/livres/..." className={getCommonFormStyles()} />
                  <LinkIcon size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                </div>
              </div>
              <div className="space-y-3">
                <label className={getCommonLabelStyles()}>Où en étiez-vous ? (Ex: Leçon 2, paragraphe 3)</label>
                <div className="relative">
                  <input type="text" value={nvStudyChapterParagraph} onChange={(e) => setNvStudyChapterParagraph(e.target.value)}
                    placeholder="Leçon 2, paragraphe 3" className={getCommonFormStyles()} />
                  <BookOpen size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                </div>
              </div>
              <button onClick={() => handleGenerateContent(
                  `Nouvelle Visite (Cours): ${nvStudyLink}`,
                  `Cours Biblique: ${nvStudyLink}, Arrêté à: ${nvStudyChapterParagraph}`,
                  'nouvelle_visite'
                )}
                style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-5 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />}
                <span>Générer la préparation</span>
              </button>
            </div>
          )}

          {nvType === 'question' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="space-y-3">
                <label className={getCommonLabelStyles()}>Question laissée en suspens</label>
                <textarea value={nvQuestionLeft} onChange={(e) => setNvQuestionLeft(e.target.value)}
                  placeholder="Ex: Pourquoi Dieu permet-il la souffrance ?"
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium resize-none" />
              </div>
              <div className="space-y-3">
                <label className={getCommonLabelStyles()}>Lien de la brochure 'Vivez pour toujours' (pour proposer l'étude)</label>
                <div className="relative">
                  <input type="text" value={nvBrochureLink} onChange={(e) => setNvBrochureLink(e.target.value)}
                    placeholder="https://www.jw.org/fr/publications/livres/vivez-pour-toujours-livre-de-base-du-cours-biblique/lecon-1/" className={getCommonFormStyles()} />
                  <LinkIcon size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                </div>
              </div>
              <button onClick={() => handleGenerateContent(
                  `Nouvelle Visite (Question): ${nvQuestionLeft}`,
                  `Question en suspens: ${nvQuestionLeft}, Offre étude: ${nvBrochureLink}`,
                  'nouvelle_visite'
                )}
                style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-5 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />}
                <span>Générer la préparation</span>
              </button>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 bg-red-500/10 text-red-400 rounded-lg flex items-center space-x-2">
              <AlertTriangle size={20} /> <p className="text-sm">{cooldown > 0 ? `Veuillez patienter ${cooldown}s.` : error}</p>
            </div>
          )}
          <button onClick={resetAllStates} className="mt-8 w-full bg-white/5 border border-white/10 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
            Annuler / Recommencer
          </button>
        </div>
      )}

      {predicationMode === 'cours_biblique' && (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl relative">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-6" style={{ color: 'var(--btn-color)' }}>Préparation de Cours Biblique</h3>

          <div className="space-y-3">
            <label className={getCommonLabelStyles()}>Progression de l'étude</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setCbType('new')} className={getCommonButtonStyles(cbType === 'new')}>Nouveau chapitre</button>
              <button onClick={() => setCbType('ongoing')} className={getCommonButtonStyles(cbType === 'ongoing')}>En plein chapitre</button>
            </div>
          </div>

          {cbType && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {cbType === 'ongoing' && (
                <div className="space-y-3">
                  <label className={getCommonLabelStyles()}>Où en êtes-vous ? (Ex: Chapitre 4, paragraphe 2)</label>
                  <div className="relative">
                    <input type="text" value={cbChapterParagraph} onChange={(e) => setCbChapterParagraph(e.target.value)}
                      placeholder="Chapitre 4, paragraphe 2" className={getCommonFormStyles()} />
                    <BookOpen size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                  </div>
                </div>
              )}
              <div className="space-y-3">
                <label className={getCommonLabelStyles()}>Lien direct de la publication (jw.org)</label>
                <div className="relative">
                  <input type="text" value={cbPublicationLink} onChange={(e) => setCbPublicationLink(e.target.value)}
                    placeholder="https://www.jw.org/fr/publications/livres/vivez-pour-toujours-livre-de-base-du-cours-biblique/" className={getCommonFormStyles()} />
                  <LinkIcon size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                </div>
              </div>
              <button onClick={() => handleGenerateContent(
                  `Cours Biblique: ${cbType === 'new' ? 'Nouveau Chapitre' : `Suite: ${cbChapterParagraph}`}`,
                  `Publication: ${cbPublicationLink}${cbType === 'ongoing' ? `, Arrêté à: ${cbChapterParagraph}` : ''}`,
                  'cours_biblique'
                )}
                style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-5 rounded-xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center space-x-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />}
                <span>Générer la préparation</span>
              </button>
            </div>
          )}
          {error && (
            <div className="mt-8 p-4 bg-red-500/10 text-red-400 rounded-lg flex items-center space-x-2">
              <AlertTriangle size={20} /> <p className="text-sm">{cooldown > 0 ? `Veuillez patienter ${cooldown}s.` : error}</p>
            </div>
          )}
          <button onClick={resetAllStates} className="mt-8 w-full bg-white/5 border border-white/10 py-3 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all">
            Annuler / Recommencer
          </button>
        </div>
      )}
    </div>
  );
};

export default PredicationTool;