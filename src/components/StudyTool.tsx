// Fix: Removed 'DELETE_FILE' from the beginning of the file.
import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Globe, Check, ShieldCheck, AlertTriangle, RefreshCw, Timer } from 'lucide-react';
import { StudyPart, GeneratedStudy, AppSettings } from '../types'; 
import { generateStudyContent } from '../services/geminiService'; 

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
}

const studyPartOptions: { value: StudyPart; label: string }[] = [
  { value: 'tout', label: 'Tout l\'article' },
  { value: 'perles', label: 'Perles Spirituelles' },
  { value: 'joyaux', label: 'Joyaux de la Parole de Dieu' },
  { value: 'ministere', label: 'Applique-toi au Ministère' },
  { value: 'vie_chretienne', label: 'Vie Chrétienne' },
  { value: 'etude_biblique', label: 'Étude Biblique de l\'Assemblée' },
];

const StudyTool: React.FC<Props> = ({ type, onGenerated, settings }) => {
  const [mode, setMode] = useState<'link' | 'date'>('link');
  const [input, setInput] = useState('');
  const [selectedPart, setSelectedPart] = useState<StudyPart>('tout'); // État pour la partie d'étude
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [preview, setPreview] = useState<{title: string, theme?: string} | null>(null);
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
  };

  const handleGenerate = async (isRetry = false) => {
    if (loading || cooldown > 0 || !input.trim()) return;
    
    setLoading(true);
    setError(null);
    const isLinkMode = mode === 'link';
    setLoadingStep(isLinkMode ? 'Analyse du lien...' : 'Recherche sur JW.ORG...');
    
    try {
      const result = await generateStudyContent(type, input.trim(), selectedPart, settings); // Passe selectedPart
      
      if (!isRetry && !preview) {
        setPreview({ title: result.title, theme: result.theme });
      } else {
        setLoadingStep('Enregistrement...');
        const newStudy: GeneratedStudy = {
          id: Date.now().toString(),
          type,
          title: result.title,
          date: new Date().toLocaleDateString('fr-FR'),
          content: result.text,
          timestamp: Date.now(),
          url: input.startsWith('http') ? input.trim() : undefined,
          part: type === 'MINISTRY' ? selectedPart : undefined // Sauvegarde la partie pour Ministry
        };
        onGenerated(newStudy);
        setPreview(null);
        setInput('');
        localStorage.removeItem(`draft_${type}`);
      }
    } catch (err: any) {
      if (err.message === 'COOLDOWN_REQUIRED') {
        setError("Limite globale des requêtes Google atteinte. Les tentatives répétées prolongeront le délai de récupération. Veuillez patienter pour réessayer.");
        setCooldown(90); // Cooldown plus long pour les limites API globales
      } else if (err.message === 'SEARCH_QUOTA_EXCEEDED') {
        setError("Le service de recherche Google est temporairement saturé. Veuillez réessayer avec un 'Lien direct' ou patientez.");
        setCooldown(60); // Cooldown spécifique à la recherche
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
    } finally {
      setLoading(false);
      setLoadingStep('');
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
          <button onClick={() => { setMode('link'); setInput(''); setError(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'link' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Lien direct</button>
          <button onClick={() => { setMode('date'); setInput(''); setError(null); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'date' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Recherche</button>
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
              disabled={cooldown > 0}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={mode === 'link' ? "https://www.jw.org/..." : "Ex: 25 novembre 2025"}
              className={`w-full bg-black/40 border border-white/10 rounded-xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium ${cooldown > 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">
              {mode === 'link' ? <LinkIcon size={22} /> : <Search size={22} />}
            </div>
          </div>
        </div>

        {type === 'MINISTRY' && (
          <div className="space-y-3 pt-4 border-t border-white/5">
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

        {error && (
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm animate-in fade-in zoom-in duration-300">
            <div className="flex items-start space-x-3 mb-4">
              <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                 <p className="uppercase text-xs font-black tracking-widest">Alerte de Quota</p>
                 <p className="font-normal opacity-90 leading-relaxed">
                   {cooldown > 0 
                    ? `Google limite l'utilisation gratuite. Veuillez patienter ${cooldown} secondes. Les tentatives répétées prolongent ce délai.`
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

        <button
          onClick={() => handleGenerate()}
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
              <span className="text-xl">Lancer l'étude</span>
            </div>
          )}
        </button>
        
        {mode === 'date' && (
          <p className="text-[10px] text-center opacity-30 font-bold uppercase tracking-tighter">
            Note: La recherche par date utilise l'outil Google Search, qui est soumis à des quotas plus strictes.
          </p>
        )}
      </div>

      {preview && (
        <div className="bg-white/5 border border-white/20 rounded-[2.5rem] p-10 animate-in zoom-in-95 duration-500 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[var(--btn-color)]" />
          <div className="flex items-center space-x-3 mb-6 text-[var(--btn-color)]">
            <Check size={24} className="stroke-[3]" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">Article Trouvé</span>
          </div>
          <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">{preview.title}</h3>
          <p className="text-lg opacity-60 mb-8 font-serif italic">{preview.theme || "Prêt pour l'analyse"}</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => handleGenerate(true)} 
              disabled={loading || cooldown > 0}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
              className="flex-1 py-5 rounded-xl font-black text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
              <span>Générer les réponses</span>
            </button>
            <button onClick={() => setPreview(null)} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-xl font-black text-sm uppercase tracking-widest">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyTool;