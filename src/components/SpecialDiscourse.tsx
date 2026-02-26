import React, { useState } from 'react';
import { AppSettings } from '../types';

interface SpecialDiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

enum TimeOptions {
  FIVE_MIN = '5min',
  TEN_MIN = '10min',
  THIRTY_MIN = '30min',
  FORTY_MIN = '40min',
  ONE_HOUR = '1h',
}

const SpecialDiscourse: React.FC<SpecialDiscourseProps> = ({ settings, setGlobalLoadingMessage }) => {
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customTime, setCustomTime] = useState<string>('');
  const [themeInput, setThemeInput] = useState<string>('');
  const [generateTheme, setGenerateTheme] = useState<boolean>(false);
  const [generatedTheme, setGeneratedTheme] = useState<string | null>(null);

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
    setGeneratedTheme(null);
  };

  const handleSubmit = async () => {
    if (!selectedTime) {
      alert('Veuillez sélectionner une durée pour le discours.');
      return;
    }

    setGlobalLoadingMessage('Génération du discours...');

    try {
      let finalTheme = themeInput;
      if (generateTheme) {
        const response = await fetch('/api/generate-discourse-theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            criteria: { time: selectedTime, themeCriteria: themeInput },
            language: settings.language,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate theme');
        }

        const data = await response.json();
        finalTheme = data.theme;
        setGeneratedTheme(finalTheme);
      }

      console.log({
        selectedTime,
        finalTheme,
        generateTheme,
      });
      alert(`Discours Spécial généré avec le thème : ${finalTheme} (Placeholder)`);
    } catch (error) {
      console.error('Error in Special discourse generation:', error);
      alert(`Erreur lors de la génération du discours Spécial: ${error.message}`);
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-3">
          <div className="p-2 bg-[var(--btn-color)]/20 rounded-xl">
            <span className="text-[var(--btn-color)]">⭐</span>
          </div>
          Discours Spécial
        </h3>

        {/* Time Selection */}
        <div className="mb-8">
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
        </div>

        {/* Theme Selection */}
        <div className="mb-8">
          <label className="text-[10px] font-black uppercase opacity-40 ml-2 tracking-widest mb-3 block">Thème du discours</label>
          
          <div className="flex items-center gap-3 mb-4 p-4 bg-black/20 rounded-xl border border-white/5 cursor-pointer hover:bg-white/5 transition-colors" onClick={handleGenerateThemeToggle}>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${generateTheme ? 'bg-[var(--btn-color)] border-[var(--btn-color)]' : 'border-white/20'}`}>
              {generateTheme && <span className="text-[var(--btn-text)] text-sm">✓</span>}
            </div>
            <span className="text-sm font-bold">Laisser l'IA générer le thème</span>
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
              {generatedTheme && (
                <div className="p-4 bg-[var(--btn-color)]/10 border border-[var(--btn-color)]/30 rounded-xl">
                  <p className="text-xs uppercase opacity-60 font-bold mb-1 tracking-wider text-[var(--btn-color)]">Thème généré</p>
                  <p className="font-medium text-lg">{generatedTheme}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content Inclusion (Placeholder) */}
        <div className="mb-8 p-6 bg-black/20 border border-white/5 rounded-2xl">
          <label className="text-[10px] font-black uppercase opacity-40 tracking-widest mb-2 block">Inclure du contenu</label>
          <p className="text-sm opacity-60 italic">Fonctionnalité à venir : articles, images, vidéos, versets bibliques.</p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full py-5 bg-[var(--btn-color)] text-[var(--btn-text)] font-black uppercase tracking-widest rounded-xl shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <span>Générer le Discours Spécial</span>
        </button>
      </div>
    </div>
  );
};

export default SpecialDiscourse;
