import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AppSettings } from '../types';
import { getContrastTextColor } from '../utils/colorUtils.ts';
import { Star, Target, ThumbsUp, Heart, ChevronRight } from 'lucide-react';

interface SpecialDiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const SpecialDiscourse: React.FC<SpecialDiscourseProps> = ({ settings, setGlobalLoadingMessage }) => {
  const [step, setStep] = useState(1);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [themeInput, setThemeInput] = useState<string>('');
  const [pointToReinforce, setPointToReinforce] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
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
    setGlobalLoadingMessage('Préparation du discours spécial...');
    try {
      const prompt = `
        Rédige un discours spécial pour une assemblée ou un événement marquant.
        Durée : ${selectedTime || customTime}.
        Thème : ${themeInput}.
        
        Points spécifiques à l'assemblée :
        - À renforcer : ${pointToReinforce || "Non spécifié"}.
        - Points forts : ${strengths || "Non spécifié"}.
        - Encouragements : ${encouragements || "Non spécifié"}.
        
        Instructions :
        - Ton solennel mais chaleureux.
        - Cite intégralement les versets bibliques.
        - Intègre les points spécifiques de manière fluide.
        - Structure claire.
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
      <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black uppercase flex items-center gap-3 text-gray-900">
            <div className="p-2 bg-[var(--btn-color)]/10 rounded-xl">
              <Star className="text-[var(--btn-color)]" />
            </div>
            Discours Spécial
          </h3>
          <div className="text-sm font-bold text-gray-400">Étape {step} / 3</div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase text-gray-700">1. Choisissez la durée</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {['30min', '45min', '1h'].map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeChange(time)}
                  className={`p-4 rounded-xl font-bold border transition-all ${selectedTime === time ? 'bg-[var(--btn-color)] border-[var(--btn-color)] text-[var(--btn-text)]' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}`}
                >
                  {time}
                </button>
              ))}
              <input
                type="text"
                placeholder="Autre"
                value={customTime}
                onChange={(e) => { setCustomTime(e.target.value); setSelectedTime(null); }}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--btn-color)] focus:ring-1 focus:ring-[var(--btn-color)] text-center font-bold text-gray-900 placeholder-gray-400"
              />
            </div>
            <button onClick={handleNextStep} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4 hover:opacity-90 transition-opacity">
              Suivant <ChevronRight className="inline ml-2" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase text-gray-700">2. Définissez le thème</h4>
            <input
              type="text"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              placeholder="Thème de l'événement spécial..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--btn-color)] focus:ring-1 focus:ring-[var(--btn-color)] text-gray-900 placeholder-gray-400"
            />
            <button onClick={handleNextStep} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4 hover:opacity-90 transition-opacity">
              Suivant <ChevronRight className="inline ml-2" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right">
            <h4 className="text-lg font-bold uppercase text-gray-700">3. Besoins de l'Assemblée</h4>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 mb-2 font-bold text-gray-700"><Target size={18} /> Points à renforcer</label>
                <textarea
                  value={pointToReinforce}
                  onChange={(e) => setPointToReinforce(e.target.value)}
                  placeholder="Quels aspects doivent être améliorés ?"
                  className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:border-[var(--btn-color)] focus:ring-1 focus:ring-[var(--btn-color)] outline-none h-24 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 mb-2 font-bold text-gray-700"><ThumbsUp size={18} /> Points forts</label>
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  placeholder="Qu'est-ce que l'assemblée fait bien ?"
                  className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:border-[var(--btn-color)] focus:ring-1 focus:ring-[var(--btn-color)] outline-none h-24 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <label className="flex items-center gap-2 mb-2 font-bold text-gray-700"><Heart size={18} /> Encouragements</label>
                <textarea
                  value={encouragements}
                  onChange={(e) => setEncouragements(e.target.value)}
                  placeholder="Message spécifique d'encouragement..."
                  className="w-full p-3 bg-white rounded-lg border border-gray-200 focus:border-[var(--btn-color)] focus:ring-1 focus:ring-[var(--btn-color)] outline-none h-24 text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
            <button onClick={generateDiscourse} className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-xl font-black uppercase tracking-widest mt-4 shadow-md hover:scale-[1.02] transition-transform">
              Générer le Discours Spécial
            </button>
          </div>
        )}

        {step === 4 && generatedDiscourse && (
          <div className="animate-in fade-in slide-in-from-bottom-8">
            <div className={`markdown-body prose ${proseClass} max-w-none`}>
              <Markdown>{generatedDiscourse}</Markdown>
            </div>
            <button onClick={() => setStep(1)} className="mt-8 w-full py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              Préparer un autre discours
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpecialDiscourse;