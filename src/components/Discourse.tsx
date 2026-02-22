import React, { useState } from 'react';
import NormalDiscourse from './NormalDiscourse.tsx';
import ThursdayDiscourse from './ThursdayDiscourse.tsx';
import SundayDiscourse from './SundayDiscourse.tsx';
import SpecialDiscourse from './SpecialDiscourse.tsx';
import { AppSettings } from '../types';

interface DiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

enum DiscourseType {
  NORMAL = 'normal',
  THURSDAY = 'thursday',
  SUNDAY = 'sunday',
  SPECIAL = 'special',
}

const Discourse: React.FC<DiscourseProps> = ({ settings, setGlobalLoadingMessage }) => {
  const [selectedType, setSelectedType] = useState<DiscourseType | null>(null);

  const renderDiscourseContent = () => {
    switch (selectedType) {
      case DiscourseType.NORMAL:
        return <NormalDiscourse settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />;
      case DiscourseType.THURSDAY:
        return <ThursdayDiscourse settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />;
      case DiscourseType.SUNDAY:
        return <SundayDiscourse settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />;
      case DiscourseType.SPECIAL:
        return <SpecialDiscourse settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <button
              onClick={() => setSelectedType(DiscourseType.NORMAL)}
              className="p-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Discours Normal
            </button>
            <button
              onClick={() => setSelectedType(DiscourseType.THURSDAY)}
              className="p-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Discours de Jeudi
            </button>
            <button
              onClick={() => setSelectedType(DiscourseType.SUNDAY)}
              className="p-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Discours de Dimanche
            </button>
            <button
              onClick={() => setSelectedType(DiscourseType.SPECIAL)}
              className="p-4 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Discours Spécial
            </button>
          </div>
        );
    }
  };

  return (
    <div className="p-4 text-[var(--text-color)]">
      <h2 className="text-2xl font-bold mb-4">Discours</h2>
      {!selectedType && (
        <p className="text-lg mb-4">Veuillez choisir un type de discours pour commencer :</p>
      )}
      {selectedType && (
        <button
          onClick={() => setSelectedType(null)}
          className="mb-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Retour aux types de discours
        </button>
      )}
      {renderDiscourseContent()}
    </div>
  );
};

export default Discourse;
