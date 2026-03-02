import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AppSettings } from '../types.ts';
import ContentInclusion, { ContentOptions } from './ContentInclusion.tsx';
import { getContrastTextColor } from '../utils/colorUtils.ts';
import { ChevronRight, Send, BookOpen, Mic } from 'lucide-react';

interface NormalDiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const NormalDiscourse: React.FC<NormalDiscourseProps> = ({ settings, setGlobalLoadingMessage }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ theme: '', time: '30min', refs: '' });
  const [generateTheme, setGenerateTheme] = useState<boolean>(false);
  const [generatedTheme, setGeneratedTheme] = useState<string | null>(null);
  const [generatedDiscourse, setGeneratedDiscourse] = useState<string | null>(null);
  const [contentOptions, setContentOptions] = useState<ContentOptions>({
    includeArticles: false,
    includeImages: false,
    includeVideos: false,
    includeVerses: false,
    articleLinks: [],
  });

  const textColor = getContrastTextColor(settings.bgColor || '#f5f5f0');
  const proseClass = textColor === 'white' ? 'prose-invert' : '';

  const steps = [
    { title: "Thème & Durée", desc: "Quel est le sujet principal ?" },
    { title: "Sources", desc: "Articles ou versets clés" },
    { title: "Finalisation", desc: "Génération par l'IA" }
  ];

  const handleGenerateThemeToggle = () => {
    setGenerateTheme(!generateTheme);
    setData({ ...data, theme: '' });
    setGeneratedTheme(null);
    setGeneratedDiscourse(null);
  };

  const handleNextStep = async () => {
    if (step === 1 && generateTheme && !generatedTheme) {
      setGlobalLoadingMessage('Génération du thème...');
      try {
        const themeResponse = await fetch('/api/generate-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'DISCOURS_THEME',
            input: data.theme,
            settings: settings,
          }),
        });

        if (!themeResponse.ok) {
          const errorData = await themeResponse.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.details || 'Failed to generate theme');
        }

        const themeData = await themeResponse.json();
        setGeneratedTheme(themeData.theme);
        setData({ ...data, theme: themeData.theme });
      } catch (error: any) {
        console.error('Error in theme generation:', error);
        alert(`Erreur lors de la génération du thème: ${error.message}`);
        setGlobalLoadingMessage(null);
        return;
      }
      setGlobalLoadingMessage(null);
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!data.time) {
      alert('Veuillez sélectionner une durée pour le discours.');
      return;
    }

    if (!data.theme) {
      alert('Veuillez fournir ou générer un thème pour le discours.');
      return;
    }

    setGlobalLoadingMessage('Génération du discours...');

    try {
      const discourseResponse = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DISCOURS',
          discoursType: 'normal',
          time: data.time,
          theme: data.theme,
          articleReferences: contentOptions.articleLinks,
          imageReferences: [],
          videoReferences: [],
          pointsToReinforce: [],
          strengths: [],
          encouragements: '',
          settings: settings,
          contentOptions,
        }),
      });

      if (!discourseResponse.ok) {
        const errorData = await discourseResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.details || 'Failed to generate discourse');
      }

      const discourseData = await discourseResponse.json();
      setGeneratedDiscourse(discourseData.text);
      setStep(4); // Move to result step

    } catch (error: any) {
      console.error('Error in discourse generation:', error);
      alert(`Erreur lors de la génération du discours: ${error.message}`);
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4">
      {/* Barre de progression */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${step > i ? 'bg-[var(--btn-color)]' : 'bg-white/10'}`} />
        ))}
      </div>

      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase flex items-center gap-3">
              <div className="p-2 bg-[var(--btn-color)]/20 rounded-xl">
                <Mic size={20} className="text-[var(--btn-color)]" />
              </div>
              Étape 1 : Thème & Durée
            </h3>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Durée du discours</label>
              <div className="flex flex-wrap gap-3">
                {['5min', '10min', '30min', '40min', '1h'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setData({ ...data, time })}
                    className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${data.time === time ? 'bg-[var(--btn-color)] text-[var(--btn-text)] shadow-lg scale-105' : 'bg-black/20 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:bg-white/10'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Ou entrez une durée personnalisée (ex: 25min)"
                value={!['5min', '10min', '30min', '40min', '1h'].includes(data.time) ? data.time : ''}
                onChange={(e) => setData({ ...data, time: e.target.value })}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)] transition-all text-sm mt-2"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest">Thème du discours</label>
              <div className="flex items-center gap-3 p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleGenerateThemeToggle}>
                <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${generateTheme ? 'bg-[var(--btn-color)] border-[var(--btn-color)]' : 'border-white/20'}`}>
                  {generateTheme && <span className="text-[var(--btn-text)] text-sm">✓</span>}
                </div>
                <span className="text-sm font-bold">Laisser l&apos;IA générer le thème</span>
              </div>

              {!generateTheme ? (
                <input
                  type="text"
                  placeholder="Entrez le thème de votre discours"
                  value={data.theme}
                  onChange={(e) => setData({ ...data, theme: e.target.value })}
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)] transition-all text-sm"
                />
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    placeholder="Critères pour la génération du thème (facultatif)"
                    value={data.theme}
                    onChange={(e) => setData({ ...data, theme: e.target.value })}
                    className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)] transition-all text-sm"
                  />
                  {generatedTheme && (
                    <div className="p-4 bg-[var(--btn-color)]/10 border border-[var(--btn-color)]/30 rounded-xl">
                      <p className="text-xs uppercase opacity-60 font-bold mb-1 tracking-wider text-[var(--btn-color)]">Thème généré</p>
                      <p className="font-medium text-lg">{generatedTheme}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={handleNextStep} disabled={!data.time || (!generateTheme && !data.theme)} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50">
              Continuer <ChevronRight size={18}/>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-xl font-black uppercase flex items-center gap-3">
              <div className="p-2 bg-[var(--btn-color)]/20 rounded-xl">
                <BookOpen size={20} className="text-[var(--btn-color)]" />
              </div>
              Étape 2 : Sources
            </h3>
            
            <ContentInclusion options={contentOptions} onChange={setContentOptions} />

            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="py-4 px-6 bg-white/10 text-[var(--text-color)] rounded-xl font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
                Retour
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                Continuer <ChevronRight size={18}/>
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-xl font-black uppercase flex items-center gap-3">
              <div className="p-2 bg-[var(--btn-color)]/20 rounded-xl">
                <Send size={20} className="text-[var(--btn-color)]" />
              </div>
              Étape 3 : Finalisation
            </h3>
            
            <div className="p-6 bg-black/20 border border-white/5 rounded-2xl space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest block">Thème</span>
                <p className="font-medium text-lg">{data.theme}</p>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest block">Durée</span>
                <p className="font-medium">{data.time}</p>
              </div>
              {contentOptions.articleLinks.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase opacity-40 tracking-widest block">Liens inclus</span>
                  <ul className="list-disc list-inside opacity-80 text-sm">
                    {contentOptions.articleLinks.map((link: string, i: number) => <li key={i}>{link}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep(2)} className="py-4 px-6 bg-white/10 text-[var(--text-color)] rounded-xl font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
                Retour
              </button>
              <button onClick={handleSubmit} className="flex-1 py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl hover:opacity-90 active:scale-95 transition-all">
                Générer le Discours
              </button>
            </div>
          </div>
        )}

        {step === 4 && generatedDiscourse && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h4 className="text-xl font-black uppercase tracking-wider mb-6 text-[var(--btn-color)]">Discours Généré</h4>
            <div className={`markdown-body prose ${proseClass} max-w-none`}>
              <Markdown>{generatedDiscourse}</Markdown>
            </div>
            <button onClick={() => { setStep(1); setGeneratedDiscourse(null); }} className="mt-8 w-full py-4 bg-white/10 text-[var(--text-color)] rounded-xl font-bold uppercase tracking-widest hover:bg-white/20 transition-all">
              Préparer un autre discours
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NormalDiscourse;
