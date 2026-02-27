import React, { useState } from 'react';
import { AppSettings, DiscourseType } from '../types';
import NormalDiscourse from './NormalDiscourse.tsx';
import ThursdayDiscourse from './ThursdayDiscourse.tsx';
import SundayDiscourse from './SundayDiscourse.tsx';
import SpecialDiscourse from './SpecialDiscourse.tsx';
import { Mic, Calendar, Sun, Star, ChevronLeft } from 'lucide-react';

interface DiscoursToolProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
}

const DiscoursTool: React.FC<DiscoursToolProps> = ({ settings, setGlobalLoadingMessage }) => {
  const [selectedType, setSelectedType] = useState<DiscourseType | null>(null);

  const renderContent = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <button onClick={() => setSelectedType(DiscourseType.NORMAL)} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--btn-color)] transition-all flex flex-col items-center text-center shadow-lg hover:shadow-xl">
              <Mic size={32} className="text-[var(--btn-color)] mb-4" />
              <h3 className="text-xl font-bold uppercase mb-2">Discours Normal</h3>
            </button>
            <button onClick={() => setSelectedType(DiscourseType.THURSDAY)} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--btn-color)] transition-all flex flex-col items-center text-center shadow-lg hover:shadow-xl">
              <Calendar size={32} className="text-[var(--btn-color)] mb-4" />
              <h3 className="text-xl font-bold uppercase mb-2">Discours de Semaine</h3>
            </button>
            <button onClick={() => setSelectedType(DiscourseType.SUNDAY)} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--btn-color)] transition-all flex flex-col items-center text-center shadow-lg hover:shadow-xl">
              <Sun size={32} className="text-[var(--btn-color)] mb-4" />
              <h3 className="text-xl font-bold uppercase mb-2">Discours de Week-end</h3>
            </button>
            <button onClick={() => setSelectedType(DiscourseType.SPECIAL)} className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[var(--btn-color)] transition-all flex flex-col items-center text-center shadow-lg hover:shadow-xl">
              <Star size={32} className="text-[var(--btn-color)] mb-4" />
              <h3 className="text-xl font-bold uppercase mb-2">Discours Spécial</h3>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
          <Mic className="text-[var(--btn-color)]" size={36} />
          Préparation de Discours
        </h2>
      </div>
      
      {selectedType && (
        <button onClick={() => setSelectedType(null)} className="mb-8 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 font-bold uppercase text-sm tracking-wider">
          <ChevronLeft size={18} /> Retour
        </button>
      )}
      
      {renderContent()}
    </div>
  );
};

export default DiscoursTool;
