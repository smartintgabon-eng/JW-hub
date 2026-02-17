import React, { useState, useEffect } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Globe, Check, ShieldCheck, AlertTriangle, RefreshCw, Timer, Plus, Minus, HelpCircle } from 'lucide-react'; 
// Fix: Import types from src/types.ts
import { StudyPart, GeneratedStudy, AppSettings } from '../types'; 
import { callGenerateContentApi } from '../services/apiService'; 

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void; 
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
    return localStorage.getItem(`study_mode_${type}`) as 'link' | 'date' || 'link';
  });
  // urls is an array of strings for link mode
  const [urls, setUrls] = useState<string[]>(() => {
    const savedUrls = localStorage.getItem(`draft_${type}_urls`);
    // WATCHTOWER only has one URL field
    if (type === 'WATCHTOWER') {
      return savedUrls ? [JSON.parse(savedUrls)[0] || ''] : [''];
    }
    return savedUrls ? JSON.parse(savedUrls) : [''];
  });
  const [startDateInput, setStartDateInput] = useState(() => localStorage.getItem(`draft_${type}_startDate`) || '');
  const [themeInput, setThemeInput] = useState(() => localStorage.getItem(`draft_${type}_theme`) || '');

  const [selectedPart, setSelectedPart] = useState<StudyPart>(() => {
    return localStorage.getItem(`selected_part_${type}`) as StudyPart || 'tout';
  });
  const [loading, setLoading] = useState(false);
  // url can be string (for date/theme) or string[] (for link mode)
  const [preview, setPreview] = useState<{title: string, theme?: string, url?: string | string[]} | null>(null); 
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Charger/sauvegarder les inputs du brouillon à partir/vers le localStorage
  useEffect(() => {
    if (mode === 'link') {
      const savedUrls = localStorage.getItem(`draft_${type}_urls`);
      if (type === 'WATCHTOWER') {
        setUrls(savedUrls ? [JSON.parse(savedUrls)[0] || ''] : ['']);
      } else {
        setUrls(savedUrls ? JSON.parse(savedUrls) : ['']);
      }
    } else {
      setStartDateInput(localStorage.getItem(`draft_${type}_startDate`) || '');
      setThemeInput(localStorage.getItem(`draft_${type}_theme`) || '');
    }
    localStorage.setItem(`study_mode_${type}`, mode);
  }, [type, mode]);

  useEffect(() => {
    localStorage.setItem(`draft_${type}_urls`, JSON.stringify(urls));
  }, [urls, type]);
  useEffect(() => {
    localStorage.setItem(`draft_${type}_startDate`, startDateInput);
  }, [startDateInput, type]);
  useEffect(() => {
    localStorage.setItem(`draft_${type}_theme`, themeInput);
  }, [themeInput, type]);

  useEffect(() => {
    localStorage.setItem(`selected_part_${type}`, selectedPart);
  }, [selectedPart, type]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleUrlChange = (val: string, index: number) => {
    const newUrls = [...urls];
    newUrls[index] = val;
    setUrls(newUrls);
  };

  const addUrlField = () => {
    if (urls.length < 8) { // Limite à 8 liens
      setUrls([...urls, '']);
    }
  };

  const removeUrlField = (indexToRemove: number) => {
    if (urls.length > 1) { // Toujours au moins un champ de lien
      setUrls(urls.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleDateChange = (val: string) => setStartDateInput(val);
  const handleThemeChange = (val: string) => setThemeInput(val);

  const currentCombinedInput = mode === 'date' 
    ? `${startDateInput.trim()} ${themeInput.trim()}`.trim()
    : urls.filter(Boolean).join('\n'); // Concaténer les URLs pour l'aperçu/la recherche

  const handleInitialSearch = async () => {
    if (loading || cooldown > 0 || !currentCombinedInput) return;

    setLoading(true);
    setGlobalLoadingMessage(mode === 'link' ? 'Analyse des liens...' : 'Recherche de l\'article...');
    setError(null);

    try {
      // Pour l'aperçu, on envoie soit le tableau d'URLs (si mode link) soit le texte combiné (si mode date)
      const inputForApi = mode === 'link' ? urls.filter(Boolean) : currentCombinedInput;
      const result = await callGenerateContentApi(
        type, 
        inputForApi, 
        'tout', 
        settings, 
        true, 
        undefined
      ); 
      setPreview({ 
        title: result.title, 
        theme: result.theme, 
        url: mode === 'link' ? urls.filter(Boolean) : undefined // Stocker le tableau d'URLs
      });
    } catch (err: any) {
      handleError(err);
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null); 
    }
  };

  const handleGenerateContent = async () => {
    if (loading || cooldown > 0 || !preview) return;

    setLoading(true);
    setGlobalLoadingMessage('Analyse en cours...'); 
    setError(null);

    try {
      // Pour la génération complète, on envoie soit le tableau d'URLs (si mode link) soit le texte combiné (si mode date)
      const inputForApi = mode === 'link' ? (preview.url || urls.filter(Boolean)) : currentCombinedInput;

      const result = await callGenerateContentApi(
        type, 
        inputForApi, 
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
        url: (mode === 'link' && Array.isArray(inputForApi) ? inputForApi.join('\n') : (typeof inputForApi === 'string' ? inputForApi : undefined)), // Sauvegarder l'input sous forme de string ou undefined
        content: result.text,
        timestamp: Date.now(),
        part: type === 'MINISTRY' ? selectedPart : undefined ,
        category: type === 'WATCHTOWER' ? 'tour_de_garde' : 'cahier_vie_et_ministere'
      };
      onGenerated(newStudy); 
      resetState(true); 
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

  const resetState = (clearAllInputs: boolean = true) => {
    setLoading(false);
    setError(null);
    setPreview(null);
    setGlobalLoadingMessage(null); 
    if (clearAllInputs) {
      setUrls(type === 'WATCHTOWER' ? [''] : ['']); // Reset to one empty URL field
      setStartDateInput('');
      setThemeInput('');
      localStorage.removeItem(`draft_${type}_urls`);
      localStorage.removeItem(`draft_${type}_startDate`);
      localStorage.removeItem(`draft_${type}_theme`);
    }
  };

  const getCommonFormStyles = () => `w-full bg-black/40 border border-white/10 rounded-xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none transition-all font-medium ${cooldown > 0 || loading || preview !== null ? 'opacity-30 cursor-not-allowed' : ''}`;
  const getCommonLabelStyles = () => "text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]";
  const isSearchDisabled = loading || cooldown > 0 || (mode === 'link' && urls.filter(Boolean).length === 0) || (mode === 'date' && !currentCombinedInput);


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 md:max-w-5xl md:mx-auto"> 
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
            <label className={getCommonLabelStyles()}>
              {type === 'WATCHTOWER' 
                ? 'Lien de l\'article de la Tour de Garde (jw.org)'
                : <><div className='flex items-center space-x-2'>
                  <span>Liens des articles en référence (pour l'Étude Biblique de l'Assemblée)</span>
                  <div className="relative group">
                    <HelpCircle size={16} className="opacity-50 cursor-help" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Collez ici les articles de référence du livre ou de la brochure.
                    </span>
                  </div>
                </div></>
              }
            </label>
            {(type === 'WATCHTOWER' ? [urls[0]] : urls).map((url, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <textarea
                    value={url}
                    disabled={cooldown > 0 || loading || preview !== null} 
                    onChange={(e) => handleUrlChange(e.target.value, index)}
                    placeholder="https://www.jw.org/..."
                    className={`
                      w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-14 pr-4 
                      focus:border-[var(--btn-color)] outline-none transition-all font-medium text-base leading-relaxed
                      ${cooldown > 0 || loading || preview !== null ? 'opacity-30 cursor-not-allowed' : ''}
                    `}
                    rows={1} 
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30">
                    <LinkIcon size={22} />
                  </div>
                </div>
                {type === 'MINISTRY' && (
                  <div className="flex space-x-2">
                    {urls.length < 8 && index === urls.length - 1 && (
                      <button 
                        onClick={addUrlField} 
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-md active:scale-95 transition-transform"
                        title="Ajouter un lien"
                        disabled={cooldown > 0 || loading || preview !== null}
                      >
                        <Plus size={20} />
                      </button>
                    )}
                    {urls.length > 1 && (
                      <button 
                        onClick={() => removeUrlField(index)} 
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white shadow-md active:scale-95 transition-transform"
                        title="Supprimer ce lien"
                        disabled={cooldown > 0 || loading || preview !== null}
                      >
                        <Minus size={20} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
            {type === 'MINISTRY' && <p className="text-[10px] opacity-30 text-center font-bold italic mt-2">Collez chaque lien sur une nouvelle ligne. Maximum 8 liens.</p>}
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
                  onChange={(e) => handleDateChange(e.target.value)}
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
                  onChange={(e) => handleThemeChange(e.target.value)}
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
                disabled={isSearchDisabled}
                style={{ backgroundColor: isSearchDisabled && cooldown > 0 ? '#1f2937' : 'var(--btn-color)', color: 'var(--btn-text)' }}
                className="w-full py-6 rounded-xl font-black uppercase tracking-widest flex flex-col items-center justify-center space-y-1 shadow-2xl active:scale-95 disabled:opacity-50 transition-all min-h-[100px]"
            >
                {loading ? (
                    <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="animate-spin" size={28} />
                    <span className="text-[10px] opacity-70 font-bold tracking-widest uppercase">{
                      mode === 'link' ? 'Analyse des liens...' : 'Recherche de l\'article...'
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
                    
                    {type === 'MINISTRY' && ( 
                      <div className="space-y-3 pt-4 border-t border-white/5 animate-in fade-in duration-300">
                          <label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]">
                          Choisir une partie de l'étude (Cahier)
                          </label>
                          {/* Responsive grid for study parts */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                        <span>{loading ? 'Analyse en cours...' : 'Générer les réponses'}</span>
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