
import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  Share2, 
  ChevronLeft,
  FileText,
  BookOpen,
  Calendar,
  Download,
  Printer
} from 'lucide-react';
import { GeneratedStudy, AppSettings } from '../types';
import { deleteFromHistory } from '../utils/storage';

interface Props {
  history: GeneratedStudy[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedStudy[]>>;
  settings: AppSettings;
}

const History: React.FC<Props> = ({ history, setHistory, settings }) => {
  const [selectedStudy, setSelectedStudy] = useState<GeneratedStudy | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Supprimer cette étude définitivement ?")) {
      deleteFromHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedStudy?.id === id) setSelectedStudy(null);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleShare = async (study: GeneratedStudy, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareText = `${study.title}\n\n${study.content}`;
    if (navigator.share) {
      try { await navigator.share({ title: study.title, text: shareText }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Copié !");
    }
  };

  if (selectedStudy) {
    return (
      <div className="animate-in fade-in slide-in-from-right-10 duration-700 flex flex-col h-full max-w-4xl mx-auto pb-24 print:bg-white print:text-black">
        <div className="flex items-center justify-between mb-8 sticky top-0 py-4 z-20 border-b border-white/10 px-2 bg-[var(--bg-color)] print:hidden">
          <button onClick={() => setSelectedStudy(null)} className="flex items-center space-x-3 opacity-70 hover:opacity-100 transition-all">
            <ChevronLeft size={24} />
            <span className="font-black uppercase tracking-widest text-xs">Retour</span>
          </button>
          <div className="flex items-center space-x-3">
             <button onClick={handleDownloadPDF} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10 flex items-center space-x-2">
                <Printer size={20} />
                <span className="text-[10px] font-black uppercase hidden sm:inline">PDF / Imprimer</span>
             </button>
             <button onClick={(e) => handleShare(selectedStudy, e)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10"><Share2 size={20} /></button>
             <button onClick={(e) => handleDelete(selectedStudy.id, e)} className="p-3 bg-white/5 rounded-2xl hover:bg-red-500/20 border border-white/10 hover:text-red-400"><Trash2 size={20} /></button>
          </div>
        </div>

        <article className="bg-white/5 rounded-[4rem] p-10 md:p-20 shadow-2xl border border-white/10 relative print:shadow-none print:border-0 print:p-0 print:bg-white print:text-black">
          <header className="mb-16 text-center">
             <div 
               style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
               className="text-[11px] font-black uppercase tracking-[0.4em] px-8 py-3 rounded-full mb-10 inline-block shadow-xl print:bg-black print:text-white"
             >
                {selectedStudy.type === 'WATCHTOWER' ? 'La Tour de Garde' : 'Vie et Ministère'}
             </div>
             <h1 className="text-4xl md:text-7xl font-black leading-[1.1] tracking-tighter mb-8" style={{ color: 'var(--text-color)' }}>
                {selectedStudy.title}
             </h1>
             <p className="opacity-40 font-black uppercase tracking-[0.2em] text-[10px]" style={{ color: 'var(--text-color)' }}>
                Rapport d'étude • {selectedStudy.date}
             </p>
          </header>

          <div className="space-y-12 font-serif text-xl md:text-2xl leading-relaxed print:text-black" style={{ color: 'var(--text-color)' }}>
            {selectedStudy.content.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={idx} className="h-4" />;

              if (trimmed.includes('PARAGRAPHE') || trimmed.includes('RÉVISION')) {
                return (
                  <h3 key={idx} className="text-3xl md:text-5xl font-black pt-16 border-t border-white/10 mt-20 first:mt-0 first:pt-0 first:border-0 print:text-black print:border-black" style={{ color: 'var(--btn-color)' }}>
                    {trimmed}
                  </h3>
                );
              }

              if (trimmed.startsWith('VERSET')) {
                return (
                  <div key={idx} className="p-10 my-10 bg-black/30 rounded-[2.5rem] border-l-[12px] border-[var(--btn-color)] italic shadow-inner print:border-black print:bg-gray-100">
                    <span className="block mb-4 text-xs font-black uppercase tracking-[0.2em] opacity-40 not-italic">Lecture TMN</span>
                    {trimmed.replace('VERSET À LIRE :', '').trim()}
                  </div>
                );
              }

              if (trimmed.startsWith('RÉPONSE') || trimmed.startsWith('COMMENTAIRE') || trimmed.startsWith('APPLICATION')) {
                const parts = trimmed.split(':');
                return (
                  <p key={idx} className="mt-10 font-sans">
                    <span className="font-black uppercase text-[10px] tracking-widest mr-4 px-4 py-1.5 bg-[var(--btn-color)] rounded-lg shadow-lg" style={{ color: 'var(--btn-text)' }}>
                      {parts[0]}
                    </span>
                    <span className="font-bold">{parts.slice(1).join(':')}</span>
                  </p>
                );
              }

              return <p key={idx} className="opacity-80 font-medium">{trimmed}</p>;
            })}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 pb-20">
      <div className="flex items-center space-x-8 mb-16">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-6 rounded-[2rem] shadow-2xl">
          <HistoryIcon size={40} />
        </div>
        <div>
          <h2 className="text-5xl font-black tracking-tighter">Historique</h2>
          <p className="opacity-50 font-bold text-lg">Retrouvez vos 50 dernières études.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-48 bg-white/5 border-4 border-white/5 border-dashed rounded-[5rem] text-center flex flex-col items-center">
          <FileText size={80} className="opacity-5 mb-8" />
          <p className="text-3xl font-black opacity-20 uppercase tracking-tighter">Aucune archive</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {history.map((study) => (
            <div
              key={study.id}
              onClick={() => setSelectedStudy(study)}
              className="bg-white/5 border border-white/10 rounded-[3.5rem] p-12 hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--btn-color)] opacity-[0.03] rounded-bl-[5rem] -mr-16 -mt-16 group-hover:opacity-10 transition-opacity" />
              <div className="flex justify-between items-start mb-10">
                <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-5 rounded-2xl shadow-xl">
                  {study.type === 'WATCHTOWER' ? <BookOpen size={32} /> : <Calendar size={32} />}
                </div>
                <button 
                  onClick={(e) => handleDelete(study.id, e)} 
                  className="p-4 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </div>
              <h3 className="font-black text-3xl mb-8 leading-tight line-clamp-2">{study.title}</h3>
              <div className="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                <span className="px-4 py-1.5 bg-white/5 rounded-full">{study.type === 'WATCHTOWER' ? 'Tour de Garde' : 'Ministère'}</span>
                <span>•</span>
                <span>{study.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
