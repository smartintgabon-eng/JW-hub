import React, { useState } from 'react';
import NormalDiscourse from './NormalDiscourse.tsx';
import ThursdayDiscourse from './ThursdayDiscourse.tsx';
import SundayDiscourse from './SundayDiscourse.tsx';
import SpecialDiscourse from './SpecialDiscourse.tsx';
import { AppSettings, DiscourseType } from '../types';
import { Mic, Calendar, Sun, Star, ChevronLeft } from 'lucide-react';

interface DiscourseProps {
  settings: AppSettings;
  setGlobalLoadingMessage: (message: string | null) => void;
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <button
              onClick={() => setSelectedType(DiscourseType.NORMAL)}
              className="group p-8 bg-[#111] border border-white/10 rounded-[2rem] hover:border-[#4a6da7] transition-all flex flex-col items-center text-center shadow-xl hover:bg-white/5"
            >
              <div className="w-16 h-16 rounded-full bg-[#4a6da7]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic size={32} className="text-[#4a6da7]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-white">Discours Normal</h3>
              <p className="text-sm text-gray-500">Préparation standard pour un discours de l&apos;assemblée.</p>
            </button>
            <button
              onClick={() => setSelectedType(DiscourseType.THURSDAY)}
              className="group p-8 bg-[#111] border border-white/10 rounded-[2rem] hover:border-[#4a6da7] transition-all flex flex-col items-center text-center shadow-xl hover:bg-white/5"
            >
              <div className="w-16 h-16 rounded-full bg-[#4a6da7]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Calendar size={32} className="text-[#4a6da7]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-white">Discours de Semaine</h3>
              <p className="text-sm text-gray-500">Pour les réunions de semaine (Cahier Vie et Ministère).</p>
            </button>
            <button
              onClick={() => setSelectedType(DiscourseType.SUNDAY)}
              className="group p-8 bg-[#111] border border-white/10 rounded-[2rem] hover:border-[#4a6da7] transition-all flex flex-col items-center text-center shadow-xl hover:bg-white/5"
            >
              <div className="w-16 h-16 rounded-full bg-[#4a6da7]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sun size={32} className="text-[#4a6da7]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-white">Discours de Week-end</h3>
              <p className="text-sm text-gray-500">Préparation spécifique pour les discours publics du week-end.</p>
            </button>
            <button
              onClick={() => setSelectedType(DiscourseType.SPECIAL)}
              className="group p-8 bg-[#111] border border-white/10 rounded-[2rem] hover:border-[#4a6da7] transition-all flex flex-col items-center text-center shadow-xl hover:bg-white/5"
            >
              <div className="w-16 h-16 rounded-full bg-[#4a6da7]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Star size={32} className="text-[#4a6da7]" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-wider mb-2 text-white">Discours Spécial</h3>
              <p className="text-sm text-gray-500">Pour les événements spéciaux, assemblées ou commémorations.</p>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
          <Mic className="text-[#4a6da7]" size={36} />
          Préparation de Discours
        </h2>
      </div>
      
      {!selectedType ? (
        <p className="text-lg text-gray-400 mb-8 max-w-2xl font-medium">
          Sélectionnez le type de discours que vous devez préparer. L&apos;assistant vous guidera à travers une structure adaptée à vos besoins.
        </p>
      ) : (
        <button
          onClick={() => setSelectedType(null)}
          className="mb-8 px-6 py-3 bg-[#111] border border-white/10 text-gray-300 rounded-xl hover:bg-white/5 transition-all flex items-center gap-2 font-bold uppercase text-sm tracking-wider shadow-xl"
        >
          <ChevronLeft size={18} /> Retour aux types de discours
        </button>
      )}
      
      {renderDiscourseContent()}
    </div>
  );
};

export default Discourse;