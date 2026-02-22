import React, { useState } from 'react';
import { AppSettings } from '../types';

interface NormalDiscourseProps {
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

const NormalDiscourse: React.FC<NormalDiscourseProps> = ({ settings, setGlobalLoadingMessage }) => {
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
    setGeneratedTheme(null); // Clear generated theme when toggling
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
      alert(`Discours généré avec le thème : ${finalTheme} (Placeholder)`);
    } catch (error) {
      console.error('Error in discourse generation:', error);
      alert(`Erreur lors de la génération du discours: ${error.message}`);
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  return (
    <div className="p-4 border border-gray-200 rounded-lg shadow-sm text-[var(--text-color)]">
      <h3 className="text-xl font-semibold mb-4">Discours Normal</h3>

      {/* Time Selection */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Durée du discours :</label>
        <div className="flex flex-wrap gap-3 mb-4">
          {Object.values(TimeOptions).map((time) => (
            <button
              key={time}
              onClick={() => handleTimeChange(time)}
              className={`px-4 py-2 rounded-lg transition-colors ${selectedTime === time ? 'bg-[var(--btn-color)] text-[var(--btn-text)]' : 'bg-[var(--bg-color)] text-[var(--text-color)] opacity-70 hover:opacity-100 hover:bg-white/5'}`}
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
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--btn-color)] bg-[var(--bg-color)] text-[var(--text-color)] placeholder-[var(--text-color)]/70"
        />
      </div>

      {/* Theme Selection */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Thème du discours :</label>
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="generateTheme"
            checked={generateTheme}
            onChange={handleGenerateThemeToggle}
            className="mr-2 w-5 h-5 text-[var(--btn-color)] focus:ring-[var(--btn-color)] border-gray-300 rounded"
          />
          <label htmlFor="generateTheme" className="text-base">Laisser l'IA générer le thème</label>
        </div>
        {!generateTheme && (
          <input
            type="text"
            placeholder="Entrez le thème de votre discours"
            value={themeInput}
            onChange={(e) => setThemeInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--btn-color)] bg-[var(--bg-color)] text-[var(--text-color)] placeholder-[var(--text-color)]/70"
          />
        )}
        {generateTheme && !generatedTheme && (
          <input
            type="text"
            placeholder="Critères pour la génération du thème (facultatif)"
            value={themeInput}
            onChange={(e) => setThemeInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--btn-color)] bg-[var(--bg-color)] text-[var(--text-color)] placeholder-[var(--text-color)]/70"
          />
        )}
        {generatedTheme && (
          <p className="mt-2 p-2 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-lg">Thème généré : <span className="font-semibold">{generatedTheme}</span></p>
        )}
      </div>

      {/* Content Inclusion (Placeholder) */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Inclure du contenu :</label>
        <p className="opacity-70">Fonctionnalité à venir : articles, images, vidéos, versets bibliques.</p>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full p-3 bg-[var(--btn-color)] text-[var(--btn-text)] font-bold rounded-lg shadow-md hover:opacity-90 transition-opacity"
      >
        Générer le Discours
      </button>
    </div>
  );
};

export default NormalDiscourse;
