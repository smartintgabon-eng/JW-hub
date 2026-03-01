import React, { useState } from 'react';
import NormalDiscourse from './NormalDiscourse.tsx';
import ThursdayDiscourse from './ThursdayDiscourse.tsx';
import SundayDiscourse from './SundayDiscourse.tsx';
import SpecialDiscourse from './SpecialDiscourse.tsx';
import { AppSettings, DiscourseType } from '../types.ts';
import { Mic, Calendar, Sun, Star, ChevronLeft } from 'lucide-react';

const Discourse: React.FC<{settings: AppSettings, setGlobalLoadingMessage: any}> = ({ settings, setGlobalLoadingMessage }) => {
  const [selectedType, setSelectedType] = useState<DiscourseType | null>(null);

  const renderDiscourseContent = () => {
    const common = { settings, setGlobalLoadingMessage };
    switch (selectedType) {
      case DiscourseType.NORMAL: return <NormalDiscourse {...common} />;
      case DiscourseType.THURSDAY: return <ThursdayDiscourse {...common} />;
      case DiscourseType.SUNDAY: return <SundayDiscourse {...common} />;
      case DiscourseType.SPECIAL: return <SpecialDiscourse {...common} />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <MenuCard icon={<Mic/>} title="Normal" desc="Structure standard" onClick={() => setSelectedType(DiscourseType.NORMAL)} color={settings.btnColor || 'var(--btn-color)'} />
          <MenuCard icon={<Calendar/>} title="Jeudi" desc="Réunion de semaine" onClick={() => setSelectedType(DiscourseType.THURSDAY)} color={settings.btnColor || 'var(--btn-color)'} />
          <MenuCard icon={<Sun/>} title="Dimanche" desc="Discours Public" onClick={() => setSelectedType(DiscourseType.SUNDAY)} color={settings.btnColor || 'var(--btn-color)'} />
          <MenuCard icon={<Star/>} title="Spécial" desc="Assemblées/Commémoration" onClick={() => setSelectedType(DiscourseType.SPECIAL)} color={settings.btnColor || 'var(--btn-color)'} />
        </div>
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
          <Mic style={{color: settings.btnColor || 'var(--btn-color)'}} size={36} /> Préparation de Discours
        </h2>
        {selectedType && (
          <button onClick={() => setSelectedType(null)} className="flex items-center gap-2 text-xs font-black uppercase opacity-40 hover:opacity-100">
            <ChevronLeft size={16}/> Changer de mode
          </button>
        )}
      </div>
      {renderDiscourseContent()}
    </div>
  );
};

const MenuCard = ({ icon, title, desc, onClick, color }: any) => (
  <button onClick={onClick} className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all text-left group">
    <div className="p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: `${color}20`, color: color }}>{icon}</div>
    <h3 className="text-xl font-black uppercase tracking-wider mb-2">{title}</h3>
    <p className="text-sm opacity-40">{desc}</p>
  </button>
);

export default Discourse;
