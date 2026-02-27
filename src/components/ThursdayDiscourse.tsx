import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AppSettings } from '../types';
import { getContrastTextColor } from '../utils/colorUtils.ts';
import { Calendar, FileText, Heart, Target, ChevronRight } from 'lucide-react';

interface ThursdayDiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const ThursdayDiscourse: React.FC<ThursdayDiscourseProps> = ({ settings, setGlobalLoadingMessage }) => {
  const [step, setStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [themeInput, setThemeInput] = useState<string>('');
  const [articleRef, setArticleRef] = useState<string>('');
  const [pointToReinforce, setPointToReinforce] = useState<string>('');
  const [encouragements, setEncouragements] = useState<string>('');
  const [generatedDiscourse, setGeneratedDiscourse] = useState<string | null>(null);

  const textColor = getContrastTextColor(settings.bgColor || '#f5f5f0');
  const proseClass = textColor === 'white' ? 'prose-invert' : '';

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setCustomTime('');
  };

  const handleNextStep = () => {
    if (step === 1 && !selectedTime && !customTime) return alert('Veuillez choisir une durée.');
    if (step === 2 && !themeInput) return alert('Veuillez définir un thème.');
    setStep(step + 1);
  };

  const generateDiscourse = async () => {
    setGlobalLoadingMessage('Préparation du discours de semaine...');
    try {
      const prompt = `
        Rédige un discours pour la réunion de semaine (Vie et Ministère).
        Durée : ${selectedTime || customTime} (Max 15 min).
        Thème : ${themeInput}.
        Références : ${articleRef || "Aucune"}.
        Point à renforcer : ${pointToReinforce || "Aucun spécifié"}.
        Encouragements : ${encouragements || "Généraux"}.
        
        Instructions :
        - Discours concis et pratique.
        - Cite les versets bibliques clés.
        - Pas d'images ni de vidéos.
        - Structure adaptée au temps imparti.
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
              <Calendar className="text-[var(--btn-color)]" />
            </div>
            Discours de Semaine (Jeudi)
          </h3>
          <div className="text-sm font-bold opacity-50">Étape {step} / 3</div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase opacity-80">1. Choisissez la durée (Max 15 min)</h4>
            <div className="grid grid-cols-3 gap-4">
              {['1min', '4min', '5min', '10min', '15min'].map((time) => (
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
                placeholder="Autre (ex: 8min)"
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
            <h4 className="text-lg font-bold uppercase opacity-80">2. Thème et Références</h4>
            <div className="space-y-4">
              <input
                type="text"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                placeholder="Thème du discours..."
                className="w-full p-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)]"
              />
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="flex items-center gap-2 mb-2 font-bold opacity-70"><FileText size={18} /> Article de référence (optionnel)</label>
                <input
                  type="text"
                  value={articleRef}
                  onChange={(e) => setArticleRef(e.target.value)}
                  placeholder="Lien vers l'article..."
                  className="w-full p-3 bg-black/20 rounded-lg border border-white/5 focus:border-[var(--btn-color)] outline-none"
                />
              </div>
            </div>
            <button onClick={handleNextStep} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4">
              Suivant <ChevronRight className="inline ml-2" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase opacity-80">3. Points Spécifiques</h4>
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="flex items-center gap-2 mb-2 font-bold opacity-70"><Target size={18} /> Point à renforcer (optionnel)</label>
                <input
                  type="text"
                  value={pointToReinforce}
                  onChange={(e) => setPointToReinforce(e.target.value)}
                  placeholder="Ex: Être plus régulier..."
                  className="w-full p-3 bg-black/20 rounded-lg border border-white/5 focus:border-[var(--btn-color)] outline-none"
                />
              </div>
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <label className="flex items-center gap-2 mb-2 font-bold opacity-70"><Heart size={18} /> Encouragements (optionnel)</label>
                <input
                  type="text"
                  value={encouragements}
                  onChange={(e) => setEncouragements(e.target.value)}
                  placeholder="Ex: Féliciter pour l'effort..."
                  className="w-full p-3 bg-black/20 rounded-lg border border-white/5 focus:border-[var(--btn-color)] outline-none"
                />
              </div>
            </div>
            <button onClick={generateDiscourse} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4 shadow-xl hover:scale-[1.02] transition-transform">
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

export default ThursdayDiscourse;