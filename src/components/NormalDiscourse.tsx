import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AppSettings } from '../types';
import { getContrastTextColor } from '../utils/colorUtils.ts';
import { Mic, Image as ImageIcon, Video, FileText, ChevronRight } from 'lucide-react';

interface NormalDiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const NormalDiscourse: React.FC<NormalDiscourseProps> = ({ settings, setGlobalLoadingMessage }) => {
  const [step, setStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [themeInput, setThemeInput] = useState<string>('');
  const [generateTheme, setGenerateTheme] = useState<boolean>(false);
  const [generatedTheme, setGeneratedTheme] = useState<string | null>(null);
  const [articleRef, setArticleRef] = useState<string>('');
  const [imageRef, setImageRef] = useState<string>('');
  const [videoRef, setVideoRef] = useState<string>('');
  const [generatedDiscourse, setGeneratedDiscourse] = useState<string | null>(null);

  const textColor = getContrastTextColor(settings.bgColor || '#f5f5f0');
  const proseClass = textColor === 'white' ? 'prose-invert' : '';

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setCustomTime('');
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedTime && !customTime) return alert('Veuillez choisir une durée.');
    if (step === 2 && !themeInput && !generatedTheme) return alert('Veuillez définir un thème.');
    setStep(step + 1);
  };

  const generateThemeSuggestion = async () => {
    setGlobalLoadingMessage('Recherche d\'un thème inspirant...');
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DISCOURS_THEME',
          input: themeInput || "Sujet biblique encourageant",
          settings,
        }),
      });
      const data = await response.json();
      setGeneratedTheme(data.text);
      setThemeInput(data.text);
    } catch (e) {
      alert('Erreur lors de la génération du thème.');
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  const generateFinalDiscourse = async () => {
    setGlobalLoadingMessage('Rédaction du discours en cours...');
    try {
      const prompt = `
        Rédige un discours biblique complet pour les Témoins de Jéhovah.
        Durée : ${selectedTime || customTime}.
        Thème : ${generatedTheme || themeInput}.
        Références à inclure :
        - Article : ${articleRef || "Aucun"}
        - Image : ${imageRef || "Aucune"}
        - Vidéo : ${videoRef || "Aucune"}
        
        Instructions :
        - Le discours doit être encourageant, logique et facile à suivre.
        - Cite intégralement les versets bibliques clés (ex: Psaume 105:5 partie a).
        - Explique comment utiliser l'image ou la vidéo si mentionnée.
        - Structure : Introduction, Développement (avec points principaux), Conclusion.
      `;

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DISCOURS',
          input: prompt,
          settings,
        }),
      });
      const data = await response.json();
      setGeneratedDiscourse(data.text);
      setStep(4);
    } catch (e) {
      alert('Erreur lors de la génération du discours.');
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black uppercase flex items-center gap-3">
            <div className="p-2 bg-[var(--btn-color)]/20 rounded-xl">
              <Mic className="text-[var(--btn-color)]" />
            </div>
            Discours Normal
          </h3>
          <div className="text-sm font-bold opacity-50">Étape {step} / 3</div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase opacity-80">1. Choisissez la durée</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['5min', '10min', '30min', '40min', '1h'].map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeChange(time)}
                  className={`p-4 rounded-xl font-bold border transition-all ${selectedTime === time ? 'bg-[var(--btn-color)] border-[var(--btn-color)] text-[var(--btn-text)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  {time}
                </button>
              ))}
              <input
                type="text"
                placeholder="Autre (ex: 25min)"
                value={customTime}
                onChange={(e) => { setCustomTime(e.target.value); setSelectedTime(null); }}
                className="p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)] text-center font-bold"
              />
            </div>
            <button onClick={handleNextStep} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4">
              Suivant <ChevronRight className="inline ml-2" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase opacity-80">2. Définissez le thème</h4>
            <div className="flex gap-4">
              <button
                onClick={() => setGenerateTheme(false)}
                className={`flex-1 p-4 rounded-xl font-bold border transition-all ${!generateTheme ? 'bg-[var(--btn-color)] border-[var(--btn-color)] text-[var(--btn-text)]' : 'bg-white/5 border-white/10'}`}
              >
                Je l'ai déjà
              </button>
              <button
                onClick={() => setGenerateTheme(true)}
                className={`flex-1 p-4 rounded-xl font-bold border transition-all ${generateTheme ? 'bg-[var(--btn-color)] border-[var(--btn-color)] text-[var(--btn-text)]' : 'bg-white/5 border-white/10'}`}
              >
                Suggère-moi un thème
              </button>
            </div>

            {!generateTheme ? (
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="Entrez votre thème ici..."
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)]"
              />
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  placeholder="Critères (ex: encouragement, jeunesse, foi...)"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)]"
                />
                <button onClick={generateThemeSuggestion} className="w-full py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20">
                  Générer une proposition
                </button>
              </div>
            )}
            <button onClick={handleNextStep} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4">
              Suivant <ChevronRight className="inline ml-2" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase opacity-80">3. Enrichissez le discours</h4>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="flex items-center gap-2 mb-2 font-bold opacity-70"><FileText size={18} /> Article de référence (optionnel)</label>
                <input
                  type="text"
                  value={articleRef}
                  onChange={(e) => setArticleRef(e.target.value)}
                  placeholder="Lien ou titre de l'article..."
                  className="w-full p-3 bg-black/20 rounded-lg border border-white/5 focus:border-[var(--btn-color)] outline-none"
                />
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="flex items-center gap-2 mb-2 font-bold opacity-70"><ImageIcon size={18} /> Image (optionnel)</label>
                <input
                  type="text"
                  value={imageRef}
                  onChange={(e) => setImageRef(e.target.value)}
                  placeholder="Description ou lien de l'image..."
                  className="w-full p-3 bg-black/20 rounded-lg border border-white/5 focus:border-[var(--btn-color)] outline-none"
                />
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="flex items-center gap-2 mb-2 font-bold opacity-70"><Video size={18} /> Vidéo (optionnel)</label>
                <input
                  type="text"
                  value={videoRef}
                  onChange={(e) => setVideoRef(e.target.value)}
                  placeholder="Titre ou lien de la vidéo..."
                  className="w-full p-3 bg-black/20 rounded-lg border border-white/5 focus:border-[var(--btn-color)] outline-none"
                />
              </div>
            </div>
            <button onClick={generateFinalDiscourse} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4 shadow-xl hover:scale-[1.02] transition-transform">
              Générer le Discours
            </button>
          </div>
        )}

        {step === 4 && generatedDiscourse && (
          <div className="animate-in fade-in slide-in-from-bottom-8">
            <div className={`markdown-body prose ${proseClass} max-w-none`}>
              <Markdown>{generatedDiscourse}</Markdown>
            </div>
            <button onClick={() => setStep(1)} className="mt-8 w-full py-4 bg-white/10 rounded-xl font-bold hover:bg-white/20">
              Préparer un autre discours
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NormalDiscourse;