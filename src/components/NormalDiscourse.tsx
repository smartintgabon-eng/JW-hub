import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { AppSettings } from '../types';
import ContentInclusion, { ContentOptions } from './ContentInclusion.tsx';
import { getContrastTextColor } from '../utils/colorUtils.ts';
import { generateDiscourseContent, generateDiscourseTheme } from '../services/geminiService.ts';

interface NormalDiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
  onGenerated: (study: GeneratedStudy) => void;
}

enum TimeOptions {
  FIVE_MIN = '5min',
  TEN_MIN = '10min',
  THIRTY_MIN = '30min',
  FORTY_MIN = '40min',
  ONE_HOUR = '1h',
}

const NormalDiscourse: React.FC<NormalDiscourseProps> = ({ settings, setGlobalLoadingMessage, onGenerated }) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [themeInput, setThemeInput] = useState<string>('');
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

  const [step, setStep] = useState<number>(1);

  const textColor = getContrastTextColor(settings.bgColor || '#f5f5f0');
  const proseClass = textColor === 'white' ? 'prose-invert' : '';

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
    setCustomTime('');
  };

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomTime(e.target.value);
    setSelectedTime(e.target.value);
  };

  const handleGenerateThemeToggle = () => {
    setGenerateTheme(!generateTheme);
    setThemeInput('');
    setGeneratedTheme(null); // Clear generated theme when toggling
    setGeneratedDiscourse(null); // Clear generated discourse when toggling
  };

  const handleSubmit = async () => {
    if (!selectedTime) {
      alert('Veuillez sélectionner une durée pour le discours.');
      setStep(1);
      return;
    }

    setGlobalLoadingMessage('Génération du discours...');

    try {
      let finalTheme = themeInput;
      if (generateTheme) {
        finalTheme = await generateDiscourseTheme(themeInput, settings);
        setGeneratedTheme(finalTheme);
      }

      if (!finalTheme) {
        alert('Veuillez fournir ou générer un thème pour le discours.');
        setStep(2);
        setGlobalLoadingMessage(null);
        return;
      }

      const study = await generateDiscourseContent(
        'normal',
        selectedTime,
        finalTheme,
        settings,
        contentOptions
      );
      
      const newStudy: GeneratedStudy = {
        ...study,
        category: 'discours',
        timestamp: Date.now()
      };

      setGeneratedDiscourse(study.content);
      onGenerated(newStudy);

    } catch (error: any) {
      console.error('Error in discourse generation:', error);
      alert(`Erreur lors de la génération du discours: ${error.message}`);
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black uppercase tracking-tight text-[var(--btn-color)]">Discours Normal</h3>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10">Étape {step}/3</span>
      </div>
      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%`, backgroundColor: 'var(--btn-color)' }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        {renderStepIndicator()}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest mb-3 block">Durée du discours</label>
            <div className="flex flex-wrap gap-3 mb-4">
              {Object.values(TimeOptions).map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeChange(time)}
                  className={`px-5 py-3 rounded-xl font-bold text-sm transition-all ${selectedTime === time ? 'bg-[var(--btn-color)] text-[var(--btn-text)] shadow-lg scale-105' : 'bg-black/20 text-[var(--text-color)] opacity-70 hover:opacity-100 hover:bg-white/10'}`}
                >
                  {time}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Ou entrez une durée personnalisée (ex: 25min)"
              value={customTime}
              onChange={handleCustomTimeChange}
              className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)] transition-all text-sm"
            />
            <button
              onClick={() => selectedTime ? setStep(2) : alert('Veuillez choisir une durée')}
              className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] font-black uppercase tracking-widest rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all mt-4"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <button onClick={() => setStep(1)} className="text-xs font-bold opacity-50 hover:opacity-100 flex items-center gap-2 mb-4">
              ← Retour à la durée
            </button>
            <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest mb-3 block">Thème du discours</label>
            
            <div className="flex items-center gap-3 mb-4 p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleGenerateThemeToggle}>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${generateTheme ? 'bg-[var(--btn-color)] border-[var(--btn-color)]' : 'border-white/20'}`}>
                {generateTheme && <span className="text-[var(--btn-text)] text-sm">✓</span>}
              </div>
              <span className="text-sm font-bold">Laisser l&apos;IA générer le thème</span>
            </div>

            {!generateTheme ? (
              <input
                type="text"
                placeholder="Entrez le thème de votre discours"
                value={themeInput}
                onChange={(e) => setThemeInput(e.target.value)}
                className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)] transition-all text-sm"
              />
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="Critères pour la génération du thème (facultatif)"
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-[var(--btn-color)] transition-all text-sm"
                />
              </div>
            )}
            <button
              onClick={() => (themeInput || generateTheme) ? setStep(3) : alert('Veuillez entrer un thème')}
              className="w-full py-4 bg-[var(--btn-color)] text-[var(--btn-text)] font-black uppercase tracking-widest rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all mt-4"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <button onClick={() => setStep(2)} className="text-xs font-bold opacity-50 hover:opacity-100 flex items-center gap-2 mb-4">
              ← Retour au thème
            </button>
            <ContentInclusion options={contentOptions} onChange={setContentOptions} />
            <button
              onClick={handleSubmit}
              className="w-full py-5 bg-[var(--btn-color)] text-[var(--btn-text)] font-black uppercase tracking-widest rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3 mt-4"
            >
              <span>Générer le Discours</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NormalDiscourse;
