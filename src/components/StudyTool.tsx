import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Globe, Check, ShieldCheck, AlertTriangle, RefreshCw, Timer } from 'lucide-react';
import { StudyPart, GeneratedStudy, AppSettings } from '../types'; 
import { callGenerateContentApi } from '../services/apiService'; // Utilisez le nouveau service API

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void; // Add global loading message setter
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


const StudyTool: React.FC<Props> = ({ type, onGenerated, settings, setGlobalLoadingMessage }) => {
  const [mode, setMode] = useState<'link' | 'date'>(() => {
    // Restaurer le mode depuis localStorage
    return localStorage.getItem(`study_mode_${type}`) as 'link' | 'date' || 'link';
  });
  const [input, setInput] = useState(() => {
    // Restaurer l'input (pour le mode 'link') depuis localStorage au chargement initial
    return localStorage.getItem(`draft_${type}_link`) || '';
  });
  const [startDateInput, setStartDateInput] = useState(() => localStorage.getItem(`draft_${type}_startDate`) || '');
  const [themeInput, setThemeInput] = useState(() => localStorage.getItem(`draft_${type}_theme`) || '');

  const [selectedPart, setSelectedPart] = useState<StudyPart>(() => {
    return localStorage.getItem(`selected_part_${type}`) as StudyPart || 'tout';
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{title: string, theme?: string, url?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Charger/sauvegarder l'input du brouillon à partir/vers le localStorage quand le type ou le mode change
  useEffect(() => {
    // For 'link' mode
    if (mode === 'link') {
      setInput(localStorage.getItem(`draft_${type}_link`) || '');
    } else { // For 'date' mode
      setStartDateInput(localStorage.getItem(`draft_${type}_startDate`) || '');
      setThemeInput(localStorage.getItem(`draft_${type}_theme`) || '');
    }
    localStorage.setItem(`study_mode_${type}`, mode);
  }, [type, mode]);

  // Sauvegarder les inputs du brouillon dans le localStorage à chaque modification
  useEffect(() => {
    localStorage.setItem(`draft_${type}_link`, input);
  }, [input, type]);
  useEffect(() => {
    localStorage.setItem(`draft_${type}_startDate`, startDateInput);
  }, [startDateInput, type]);
  useEffect(() => {
    localStorage.setItem(`draft_${type}_theme`, themeInput);
  }, [themeInput, type]);


  // Sauvegarder la partie sélectionnée
  useEffect(() => {
    localStorage.setItem(`selected_part_${type}`, selectedPart);
  }, [selectedPart, type]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleInputChange = (val: string, inputType: 'link' | 'startDate' | 'theme') => {
    if (inputType === 'link') setInput(val);
    else if (inputType === 'startDate') setStartDateInput(val);
    else if (inputType === 'theme') setThemeInput(val);
  };

  const resetState = (clearAllInputs: boolean = true) => {
    setLoading(false);
    setError(null);
    setPreview(null);
    setGlobalLoadingMessage(null); // Clear loading message on reset
    if (clearAllInputs) {
      setInput('');
      setStartDateInput('');
      setThemeInput('');
      localStorage.removeItem(`draft_${type}_link`);
      localStorage.removeItem(`draft_${type}_startDate`);
      localStorage.removeItem(`draft_${type}_theme`);
    }
    // selectedPart is not reset here as it's part of the user's preference for MINISTRY
  };

  const currentCombinedInput = mode === 'date' 
    ? `${startDateInput.trim()} ${themeInput.trim()}`.trim()
    : input.trim();

  const handleInitialSearch = async () => {
    if (loading || cooldown > 0 || !currentCombinedInput) return;

    setLoading(true);
    setGlobalLoadingMessage(mode === 'link' ? 'Analyse du lien...' : 'Recherche de l\'article...');
    setError(null);

    try {
      // Uniquement pour obtenir le titre/thème pour l'aperçu, pas la génération complète
      const result = await callGenerateContentApi(
        type, 
        currentCombinedInput, // Use the combined input
        'tout', 
        settings, 
        true, 
        undefined
      ); 
      setPreview({ title: result.title, theme: result.theme, url: mode === 'link' && currentCombinedInput.startsWith('http') ? currentCombinedInput : undefined });
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null); // Clear loading message
    }
  };

  const handleGenerateContent = async () => {
    if (loading || cooldown > 0 || !preview) return;

    setLoading(true);
    setGlobalLoadingMessage('Génération des réponses en cours...');
    setError(null);

    try {
      const result = await callGenerateContentApi(
        type, 
        preview.url || currentCombinedInput, // Use the URL from the preview or the combined input
        selectedPart, 
        settings, 
        false, 
        undefined
      ); 
      
      setGlobalLoadingMessage('Enregistrement de l\'étude et redirection...');
      const newStudy: GeneratedStudy = {
        id: Date.now().toString(),
        type,
        title: result.title,
        date: new Date().toLocaleDateString('fr-FR'),
        content: result.text,
        timestamp: Date.now(),
        url: preview.url || (mode === 'link' && currentCombinedInput.startsWith('http') ? currentCombinedInput : undefined), // Use the URL from the preview or the original link input
        part: type === 'MINISTRY' ? selectedPart : undefined ,
        category: type === 'WATCHTOWER' ? 'tour_de_garde' : 'cahier_vie_et_ministere'
      };
      onGenerated(newStudy); // This will also navigate to history and clear loading message
      resetState(true); // Clear input after successful generation
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
      // Global loading message is cleared by onGenerated on success.
      // If error occurs, it's cleared by handleError
    }
  };

  const handleError = (err: any) => {
    // La réponse de l'API contient déjà des messages d'erreur formatés
    setGlobalLoadingMessage(null); // Always clear global loading on error
    setError(err.message || "Une erreur inconnue est survenue.");
    
    // Si l'erreur vient du cooldown, mettez à jour le compteur
    if (err.message && err.message.includes('patienter')) {
      // Extraire le nombre de secondes si le message contient "Veuillez patienter Xs"
      const match = err.message.match(/patienter (\d+)s/);
      if (match && match[1]) {
        setCooldown(parseInt(match[1]));
      } else {
        setCooldown(90); // Fallback si le format n'est pas celui attendu
      }
    }
  };

  const getCommonFormStyles = () => `w-full bg-black/40 border border-white/10 rounded-xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium ${cooldown > 0 || loading || preview !== null ? 'opacity-30 cursor-not-allowed' : ''}`;
  const getCommonLabelStyles = () => "text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-xl">
            {type === 'WATCHTOWER' ? <Globe size={28} /> : <Calendar size={28} />}
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier de Réunion'}</h2>
        </div>
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button onClick={() => { setMode('link'); resetState(false); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'link' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Lien direct</button>
          <button onClick={() => { setMode('date'); resetState(false); }} className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${mode === 'date' ? 'bg-white/10 shadow' : 'opacity-40'}`}>Recherche par date/thème</button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-8 shadow-2xl relative">
        {mode === 'link' && (
          <div className="space-y-3">
            <label className={getCommonLabelStyles()}>Lien de l'article JW.ORG</label>
            <div className="relative">
              <input
                type="text"
                value={input}
                disabled={cooldown > 0 || loading || preview !== null} 
                onChange={(e) => handleInputChange(e.target.value, 'link')}
                placeholder="https://www.jw.org/..."
                className={getCommonFormStyles()}
              />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">
                <LinkIcon size={22} />
              </div>
            </div>
          </div>
        )}

        {mode === 'date' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className={getCommonLabelStyles()}>Date de début de semaine (JJ/MM/AAAA)</label>
              <div className="relative">
                <input
                  type="text"
                  value={startDateInput}
                  disabled={cooldown > 0 || loading || preview !== null} 
                  onChange={(e) => handleInputChange(e.target.value, 'startDate')}
                  placeholder="Ex: 25/11/2025"
                  className={getCommonFormStyles()}
                />
                <Calendar size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
              </div>
            </div>
            <div className="space-y-3">
              <label className={getCommonLabelStyles()}>Thème principal (facultatif)</label>
              <div className="relative">
                <input
                  type="text"
                  value={themeInput}
                  disabled={cooldown > 0 || loading || preview !== null} 
                  onChange={(e) => handleInputChange(e.target.value, 'theme')}
                  placeholder="Ex: Soyez courageux !"
                  className={getCommonFormStyles()}
                />
                <Search size={22} className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
              </div>
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
              <button onClick={() => resetState(true)} className="w-full text-[10px] font-black uppercase tracking-widest bg-white/10 py-3 rounded-xl hover:bg-white/20 transition-all">
                Réessayer
              </button>
            )}
          </div>
        )}

        {!preview ? (
            <button
                onClick={() => handleInitialSearch()}
                disabled={loading || cooldown > 0 || !currentCombinedInput}
                style={{ backgroundColor: cooldown > 0 ? '#1f2937' : 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-6 rounded-xl font-black uppercase tracking-widest flex flex-col items-center justify-center space-y-1 shadow-2xl active:scale-95 disabled:opacity-50 transition-all min-h-[100px]"
            >
                {loading ? (
                    <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="animate-spin" size={28} />
                    <span className="text-[10px] opacity-70 font-bold tracking-widest uppercase">{
                      mode === 'link' ? 'Analyse du lien...' : 'Recherche de l\'article...'
                    }</span>
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
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                        <span>Générer les réponses</span>
                        </button>
                        <button onClick={() => resetState(true)} className="flex-1 bg-white/5 border border-white/10 py-5 rounded-xl font-black text-sm uppercase tracking-widest">Recommencer la recherche</button>
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