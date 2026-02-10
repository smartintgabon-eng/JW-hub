import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Globe, Check, ShieldCheck, AlertTriangle, RefreshCw, Timer } from 'lucide-react';
import { StudyPart, GeneratedStudy, AppSettings } from '../types'; 
import { generateStudyContent } from '../services/geminiService'; 

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
}

// Définition de studyPartOptions ici pour éviter les conflits de types et la double définition.
export const studyPartOptions: { value: StudyPart; label: string }[] = [
  { value: 'joyaux_parole_dieu', label: 'Joyaux de la Parole de Dieu' },
  { value: 'perles_spirituelles', label: 'Perles Spirituelles' },
  { value: 'applique_ministere', label: 'Applique-toi au Ministère' },
  { value: 'vie_chretienne', label: 'Vie Chrétienne' },
  { value: 'etude_biblique_assemblee', label: 'Étude Biblique de l\'Assemblée' },
  { value: 'tout', label: 'Toutes les parties' },
];


const StudyTool: React.FC<Props> = ({ type, onGenerated, settings }) => {
  const [mode, setMode] = useState<'link' | 'date'>('link');
  const [input, setInput] = useState('');
  const [selectedPart, setSelectedPart] = useState<StudyPart>('tout'); // État pour la partie d'étude
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [preview, setPreview] = useState<{title: string, theme?: string, url?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem(`draft_${type}`);
    if (saved) setInput(saved);
  }, [type]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleInputChange = (val: string) => {
    setInput(val);
    localStorage.setItem(`draft_${type}`, val);
  };

  const resetState = () => {
    setLoading(false);
    setError(null);
    setLoadingStep('');
    setPreview(null);
    setInput(''); // Clear input on reset
    setSelectedPart('tout'); // Reset selected part
    localStorage.removeItem(`draft_${type}`);
  };

  const handleInitialSearch = async () => {
    if (loading || cooldown > 0 || !input.trim()) return;

    setLoading(true);
    setError(null);
    setLoadingStep(mode === 'link' ? 'Analyse du lien...' : 'Recherche sur JW.ORG...');

    try {
      // Uniquement pour obtenir le titre/thème pour l'aperçu, pas la génération complète
      const result = await generateStudyContent(type, input.trim(), 'tout', settings, 0, true); 
      setPreview({ title: result.title, theme: result.theme, url: input.trim().startsWith('http') ? input.trim() : undefined });
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleGenerateContent = async () => {
    if (loading || cooldown > 0 || !preview) return;

    setLoading(true);
    setError(null);
    setLoadingStep('Génération des réponses...');

    try {
      const result = await generateStudyContent(type, preview.url || input.trim(), selectedPart, settings); 
      
      setLoadingStep('Enregistrement...');
      const newStudy: GeneratedStudy = {
        id: Date.now().toString(),
        type,
        title: result.title,
        date: new Date().toLocaleDateString('fr-FR'),
        content: result.text,
        timestamp: Date.now(),
        url: preview.url, // Use the URL from the preview or the original input
        part: type === 'MINISTRY' ? selectedPart : undefined 
      };
      onGenerated(newStudy);
      setPreview(null);
      setInput('');
      localStorage.removeItem(`draft_${type}`);
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleError = (err: any) => {
    const errorStr = JSON.stringify(err);
    const status = err.status || (err.response && err.response.status);

    if (err.message === 'COOLDOWN_REQUIRED') {
      setError("Limite globale des requêtes Google atteinte. Les tentatives répétées prolongeront le délai de récupération. Veuillez patienter pour réessayer.");
      setCooldown(90); 
    } else if (err.message === 'SEARCH_QUOTA_EXCEEDED') {
      setError("Le service de recherche Google est temporairement saturé. Veuillez réessayer avec un 'Lien direct' ou patientez.");
      setCooldown(60); 
    } else if (err.message === 'INVALID_API_KEY') {
      setError("Clé API invalide. Vérifiez que votre clé est correcte et configurée dans votre projet Google Cloud (et Vercel si déployé).");
    } else if (err.message === 'BILLING_REQUIRED') {
      setError("La recherche nécessite une configuration de facturation active sur Google Cloud, même pour les usages gratuits. (ai.google.dev/gemini-api/docs/billing)");
    } else if (err.message.startsWith('GENERIC_API_ERROR')) {
      setError(`Une erreur de communication est survenue avec l'API Gemini (${err.message.split(': ')[1]}). Vérifiez votre connexion.`);
    } else if (err.message === "MODEL_PROCESSING_ERROR") {
        setError("L'IA n'a pas pu trouver ou analyser l'article. Essayez un lien direct ou une formulation différente.");
    } else {
      setError("Connexion interrompue ou erreur inconnue. Veuillez vérifier votre connexion ou réessayer dans quelques minutes.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-xl">
            {type === 'WATCHTOWER' ? <Globe size={28} /> : <Calendar size={28} />}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier de Réunion'}</h2>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button onClick={() => { setMode('link'); resetState(); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'link' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Lien direct</button>
          <button onClick={() => { setMode('date'); resetState(); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'date' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Recherche</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl relative">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]">
            {mode === 'link' ? "Lien de l'article JW.ORG" : "Date ou Thème de l'étude"}
          </label>
          <div className="relative">
            <input
              type={mode === 'link' ? "text" : "text"}
              value={input}
              disabled={cooldown > 0 || loading || preview !== null} 
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === 'link' ? "https://www.jw.org/..." : "Ex: 25 novembre 2025"}
              className={`w-full bg-black/40 border border-white/10 rounded-xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium ${cooldown > 0 || loading || preview !== null ? 'opacity-30 cursor-not-allowed' : ''}`}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">
              {mode === 'link' ? <LinkIcon size={22} /> : <Search size={22} />}
            </div>
          </div>
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
              <button onClick={() => resetState()} className="w-full text-[10px] font-black uppercase tracking-widest bg-white/10 py-3 rounded-xl hover:bg-white/20 transition-all">
                Réessayer
              </button>
            )}
          </div>
        )}

        {!preview ? (
            <button
                onClick={() => handleInitialSearch()}
                disabled={loading || cooldown > 0 || !input.trim()}
                style={{ backgroundColor: cooldown > 0 ? '#1f2937' : 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-6 rounded-xl font-black uppercase tracking-widest flex flex-col items-center justify-center space-y-1 shadow-2xl active:scale-95 disabled:opacity-50 transition-all min-h-[100px]"
            >
                {loading ? (
                    <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="animate-spin" size={28} />
                    <span className="text-[10px] opacity-70 font-bold tracking-widest uppercase">{loadingStep}</span>
                    </div>
                ) : (
                    <div className="flex items-center space-x-3">
                    <Search size={24} />
                    <span className="text-xl">Lancer la recherche</span>
                    </div>
                )}
            </button>
        ) : (
            <>
                <div className="bg-white/5 border border-white/20 rounded-[2.5rem] p-10 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden mt-8">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[var(--btn-color)]" />
                    <div className="flex items-center space-x-3 mb-6 text-[var(--btn-color)]">
                    <Check size={24} className="stroke-[3]" />
                    <span className="text-xs font-black uppercase tracking-[0.3em]">Article Trouvé</span>
                    </div>
                    <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">{preview.title}</h3>
                    <p className="text-lg opacity-60 mb-8 font-serif italic">{preview.theme || "Prêt pour l'analyse"}</p>
                    
                    {type === 'MINISTRY' && ( // Show part selection AFTER preview
                      <div className="space-y-3 pt-4 border-t border-white/5 animate-in fade-in duration-300">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]">
                          Choisir une partie de l'étude (Cahier)
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {studyPartOptions.map(option => (
                              <button
                              key={option.value}
                              onClick={() => setSelectedPart(option.value)}
                              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                  selectedPart === option.value
                                  ? 'bg-[var(--btn-color)] text-[var(--btn-text)] shadow'
                                  : 'bg-white/5 opacity-60 hover:opacity-100'
                              }`}
                              >
                              {option.label}
                              </button>
                          ))}
                          </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 mt-8">
                        <button 
                        onClick={() => handleGenerateContent()} 
                        disabled={loading || cooldown > 0}
                        style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
                        className="flex-1 py-5 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
                        >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                        <span>Générer les réponses</span>
                        </button>
                        <button onClick={() => resetState()} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-xl font-black text-sm uppercase tracking-widest">Recommencer la recherche</button>
                    </div>
                </div>
            </>
        )}
        
        {mode === 'date' && (
          <p className="text-[10px] text-center opacity-30 font-bold uppercase tracking-tighter mt-8">
            Note: La recherche par date utilise l'outil Google Search, qui est soumis à des quotas plus strictes.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudyTool;