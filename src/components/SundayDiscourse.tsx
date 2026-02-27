import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AppSettings } from '../types';
import { getContrastTextColor } from '../utils/colorUtils.ts';
import { Sun, Search } from 'lucide-react';

interface SundayDiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const SundayDiscourse: React.FC<SundayDiscourseProps> = ({ settings, setGlobalLoadingMessage }) => {
  const [step, setStep] = useState(1);
  const [themeInput, setThemeInput] = useState<string>('');
  const [generateTheme, setGenerateTheme] = useState<boolean>(false);
  const [generatedTheme, setGeneratedTheme] = useState<string | null>(null);
  const [generatedDiscourse, setGeneratedDiscourse] = useState<string | null>(null);

  const textColor = getContrastTextColor(settings.bgColor || '#f5f5f0');
  const proseClass = textColor === 'white' ? 'prose-invert' : '';

  const generateThemeSuggestion = async () => {
    setGlobalLoadingMessage('Recherche d\'un thème public...');
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DISCOURS_THEME',
          input: themeInput || "Sujet biblique pour le grand public",
          settings,
        }),
      });
      const data = await response.json();
      setGeneratedTheme(data.text);
      setThemeInput(data.text);
    } catch {
      alert('Erreur lors de la génération du thème.');
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  const generateDiscourse = async () => {
    setGlobalLoadingMessage('Recherche de contenu et rédaction...');
    try {
      const prompt = `
        Rédige un discours public (Dimanche) de 30 minutes exactement.
        Thème : ${generatedTheme || themeInput}.
        
        Tâche IMPORTANTE :
        1. Trouve et intègre des citations pertinentes de jw.org.
        2. Suggère des images et vidéos spécifiques de jw.org qui illustrent les points.
        3. Explique le contenu de ces médias et donne leurs liens (simulés si nécessaire pour l'exemple, mais précis si trouvés).
        4. Cite intégralement les versets bibliques.
        
        Structure :
        - Introduction captivante.
        - Corps avec points principaux illustrés par les médias trouvés.
        - Conclusion forte.
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
      setStep(3);
    } catch {
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
              <Sun className="text-[var(--btn-color)]" />
            </div>
            Discours de Week-end (Dimanche)
          </h3>
          <div className="text-sm font-bold opacity-50">Étape {step} / 2</div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase opacity-80">1. Définissez le thème (30 min fixe)</h4>
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
                  placeholder="Critères (ex: famille, prophétie, amour...)"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)]"
                />
                <button onClick={generateThemeSuggestion} className="w-full py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20">
                  Générer une proposition
                </button>
              </div>
            )}
            
            <div className="bg-[var(--btn-color)]/10 p-4 rounded-xl border border-[var(--btn-color)]/20 mt-4">
              <p className="text-sm opacity-80 flex items-start gap-2">
                <Search size={16} className="mt-1 shrink-0" />
                L'IA recherchera automatiquement des articles, images et vidéos pertinents sur jw.org pour enrichir ce discours de 30 minutes.
              </p>
            </div>

            <button onClick={generateDiscourse} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4 shadow-xl hover:scale-[1.02] transition-transform">
              Générer le Discours Complet
            </button>
          </div>
        )}

        {step === 3 && generatedDiscourse && (
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

export default SundayDiscourse;