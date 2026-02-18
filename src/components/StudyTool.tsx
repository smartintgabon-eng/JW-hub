import React, { useState } from 'react';
import { Search, Link as LinkIcon, Calendar, Loader2, Globe, Check, ShieldCheck, AlertTriangle, Plus, Minus, Type } from 'lucide-react'; 
import { StudyPart, GeneratedStudy, AppSettings } from '../types'; 

interface Props {
  type: 'WATCHTOWER' | 'MINISTRY';
  onGenerated: (study: GeneratedStudy) => void;
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void; 
}

const StudyTool: React.FC<Props> = ({ type, onGenerated, settings, setGlobalLoadingMessage }) => {
  const [mainLink, setMainLink] = useState('');
  const [extraLinks, setExtraLinks] = useState<string[]>([]);
  const [manualText, setManualText] = useState('');
  // Set useManual default based on type: true for WATCHTOWER, false for MINISTRY
  const [useManual, setUseManual] = useState(type === 'WATCHTOWER'); 
  const [loading, setLoading] = useState(false);
  const [articleConfirmed, setArticleConfirmed] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
      setError("Veuillez fournir un lien ou du texte manuel.");
      return;
    }
    setLoading(true);
    setError(null);
    setGlobalLoadingMessage("Analyse de l'article en cours...");

    try {
      // Manual mode skips confirmation for simplicity or uses Gemini to summarize
      if (useManual) {
        // For manual text, we simulate a confirmation by just showing the type and a generic summary.
        setArticleConfirmed({ 
          previewTitle: `Saisie Manuelle (${type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier'})`, 
          previewSummary: "Texte collé par l'utilisateur, prêt pour l'analyse.",
          previewImage: null // No image for manual text
        });
      } else {
        const res = await fetch('/api/search-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionOrSubject: mainLink, settings, confirmMode: true })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur de confirmation de l'article.");
        setArticleConfirmed(data);
      }
    } catch (err: any) {
      setError(err.message || "Impossible d'accéder à l'article. Essayez la saisie manuelle.");
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null);
    }
  };

  const startGeneration = async (part: StudyPart | 'tout') => {
    setLoading(true);
    setGlobalLoadingMessage(`Génération : ${part.replace(/_/g, ' ')}...`);
    
    try {
      // Combine mainLink and extraLinks if not in manual mode
      const combinedInput = !useManual ? (mainLink + (extraLinks.length ? "\n" + extraLinks.join("\n") : "")) : "";
      
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, input: combinedInput, part, settings, manualText: useManual ? manualText : null })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Erreur lors de la génération.");

      onGenerated({
        id: Date.now().toString(),
        type,
        title: data.title,
        date: new Date().toLocaleDateString('fr-FR'),
        content: data.text,
        timestamp: Date.now(),
        part: part === 'tout' ? undefined : (part as StudyPart),
        category: type === 'WATCHTOWER' ? 'tour_de_garde' : 'cahier_vie_et_ministere',
        url: useManual ? "Saisie Manuelle" : mainLink + (extraLinks.length ? ", " + extraLinks.join(", ") : "")
      });
      // Reset after successful generation
      setMainLink('');
      setExtraLinks([]);
      setManualText('');
      setUseManual(type === 'WATCHTOWER'); // Reset useManual to default for the type
      setArticleConfirmed(null);
    } catch (err: any) {
      setError(err.message || "Échec de la génération. Quotas Gemini?");
    } finally {
      setLoading(false);
      setGlobalLoadingMessage(null);
    }
  };

  const ministryOptions = [
    { id: 'joyaux_parole_dieu', label: 'JOYAUX', desc: 'Discours complet' },
    { id: 'perles_spirituelles', label: 'PERLES', desc: 'Recherche biblique' },
    { id: 'applique_ministere', label: 'APPLIQUE-TOI', desc: 'Choix de l\'exposé' },
    { id: 'vie_chretienne', label: 'VIE CHRÉTIENNE', desc: 'Analyse vidéo/article' },
    { id: 'etude_biblique_assemblee', label: 'ÉTUDE DE LIVRE', desc: 'Réponses + 5 leçons' },
    { id: 'tout', label: 'TOUT L\'ARTICLE', desc: 'Génération complète' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl font-black uppercase mb-8 flex items-center gap-4">
          <div className="p-3 bg-[var(--btn-color)] rounded-2xl"><Calendar size={28} /></div>
          {type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier de Réunion'}
        </h2>

        {!articleConfirmed ? (
          <div className="space-y-6">
            <div className="flex bg-white/5 p-1 rounded-xl w-fit mb-6">
              <button onClick={() => setUseManual(false)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${!useManual ? 'bg-white/10 shadow' : 'opacity-40'}`}>Lien jw.org</button>
              <button onClick={() => setUseManual(true)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${useManual ? 'bg-white/10 shadow' : 'opacity-40'}`}>Saisie Manuelle</button>
            </div>

            {useManual ? (
              <textarea 
                value={manualText} 
                onChange={e => setManualText(e.target.value)}
                placeholder="Collez ici le texte intégral de l'article de la Tour de Garde (copié directement depuis jw.org). L'IA utilisera cette source en priorité."
                className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-5 outline-none focus:border-[var(--btn-color)] transition-all resize-none"
              />
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Lien Principal (Semaine / Étude)</label>
                  <div className="relative mt-2">
                    <input type="text" value={mainLink} onChange={e => setMainLink(e.target.value)} placeholder="https://www.jw.org/fr/..." className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-4 focus:border-[var(--btn-color)] outline-none" />
                    <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                  </div>
                </div>

                {type === 'MINISTRY' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Liens Références Étude de livre (Optionnel)</label>
                      <button onClick={addExtraLink} className="p-2 bg-[var(--btn-color)]/20 text-[var(--btn-color)] rounded-lg hover:bg-[var(--btn-color)]/30"><Plus size={16}/></button>
                    </div>
                    <div className="space-y-3">
                      {extraLinks.map((link, i) => (
                        <div key={i} className="flex gap-2">
                          <input type="text" value={link} onChange={e => updateExtraLink(i, e.target.value)} placeholder="Lien secondaire (ex: pour l'étude de livre)..." className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 px-4 focus:border-[var(--btn-color)] outline-none text-sm" />
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
              Confirmer l'article
            </button>
          </div>
        ) : (
          <div className="animate-in fade-in zoom-in duration-500 space-y-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-[2rem] flex flex-col md:flex-row gap-8 items-center">
              {articleConfirmed.previewImage && <img src={articleConfirmed.previewImage} alt="Article" className="w-32 h-32 rounded-2xl object-cover shadow-xl" />}
              <div className="flex-1 text-center md:text-left">
                <span className="text-[10px] font-black uppercase text-[var(--btn-color)] tracking-widest">Article identifié</span>
                <h3 className="text-2xl font-black mt-1 uppercase tracking-tight">{articleConfirmed.previewTitle || articleConfirmed.title}</h3>
                <p className="text-sm opacity-50 mt-2 italic">{articleConfirmed.previewSummary || "Prêt pour l'analyse."}</p>
              </div>
              <button onClick={() => setArticleConfirmed(null)} className="text-xs font-bold opacity-30 hover:opacity-100 uppercase underline">Changer</button>
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
                Lancer l'analyse complète
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTool;