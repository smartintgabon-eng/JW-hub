
import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  Share2, 
  ChevronLeft,
  FileText,
  BookOpen,
  Calendar,
  Quote
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
    if (window.confirm("Supprimer cette étude de l'historique ?")) {
      deleteFromHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedStudy?.id === id) setSelectedStudy(null);
    }
  };

  const handleShare = async (study: GeneratedStudy, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareText = `${study.title}\n\n${study.content}`;
    if (navigator.share) {
      try { await navigator.share({ title: study.title, text: shareText }); } catch (err) {}
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Contenu copié dans le presse-papier !");
    }
  };

  if (selectedStudy) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col h-full max-w-4xl mx-auto pb-24">
        <div className="flex items-center justify-between mb-8 sticky top-0 py-4 z-20 border-b border-white/10 px-2 bg-[var(--bg-color)]">
          <button onClick={() => setSelectedStudy(null)} className="flex items-center space-x-2 opacity-70 hover:opacity-100 transition-all">
            <ChevronLeft size={24} />
            <span className="font-bold">Retour à l'historique</span>
          </button>
          <div className="flex items-center space-x-3">
             <button onClick={(e) => handleShare(selectedStudy, e)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10"><Share2 size={20} /></button>
             <button onClick={(e) => handleDelete(selectedStudy.id, e)} className="p-3 bg-white/5 rounded-2xl hover:bg-red-500/20 border border-white/10 hover:text-red-400"><Trash2 size={20} /></button>
          </div>
        </div>

        <article className="bg-white/5 rounded-[3.5rem] p-8 md:p-16 shadow-2xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
             <Quote size={120} />
          </div>

          <header className="mb-16 text-center">
             <div 
               style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
               className="text-[11px] font-black uppercase tracking-[0.3em] px-6 py-2.5 rounded-full mb-8 inline-block shadow-lg"
             >
                {selectedStudy.type === 'WATCHTOWER' ? 'La Tour de Garde' : 'Vie et Ministère'}
             </div>
             <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight mb-6" style={{ color: 'var(--text-color)' }}>
                {selectedStudy.title}
             </h1>
             <div className="h-1 w-24 bg-[var(--btn-color)] mx-auto rounded-full mb-6 opacity-50" />
             <p className="opacity-40 font-bold uppercase tracking-widest text-xs" style={{ color: 'var(--text-color)' }}>
                Généré le {selectedStudy.date}
             </p>
          </header>

          <div className="space-y-10 leading-relaxed whitespace-pre-wrap font-serif text-xl md:text-2xl" style={{ color: 'var(--text-color)' }}>
            {selectedStudy.content.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={idx} className="h-4" />;

              if (trimmed.includes('PARAGRAPHE') || trimmed.includes('QUESTIONS DE RÉVISION') || trimmed.includes('RÉVISION')) {
                return (
                  <div key={idx} className="pt-12 border-t border-white/10 mt-16 first:mt-0 first:pt-0 first:border-0">
                    <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-6" style={{ color: 'var(--btn-color)' }}>
                      {trimmed}
                    </h3>
                  </div>
                );
              }

              if (trimmed.startsWith('VERSET')) {
                return (
                  <div key={idx} className="p-8 my-8 bg-black/20 rounded-3xl border-l-8 border-[var(--btn-color)] italic font-serif text-lg md:text-xl shadow-inner opacity-90 leading-relaxed">
                    <span className="block mb-2 text-xs font-black uppercase tracking-widest not-italic opacity-50">Lecture biblique</span>
                    {trimmed.replace('VERSET À LIRE :', '').trim()}
                  </div>
                );
              }

              if (trimmed.startsWith('RÉPONSE') || trimmed.startsWith('COMMENTAIRE') || trimmed.startsWith('APPLICATION')) {
                const parts = trimmed.split(':');
                return (
                  <p key={idx} className="mt-8 font-sans">
                    <span className="font-black uppercase tracking-widest text-xs mr-3 px-3 py-1 bg-[var(--btn-color)] rounded-md" style={{ color: 'var(--btn-text)' }}>
                      {parts[0]}
                    </span>
                    <span className="font-medium">{parts.slice(1).join(':')}</span>
                  </p>
                );
              }

              return <p key={idx} className="opacity-80 font-medium leading-[1.6]">{trimmed}</p>;
            })}
          </div>
          
          <footer className="mt-20 pt-10 border-t border-white/10 text-center opacity-30 text-sm font-bold italic">
             Fin de l'étude préparée par JW Study Assistant
          </footer>
        </article>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-6 mb-12">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-5 rounded-[1.75rem] shadow-2xl">
          <HistoryIcon size={36} />
        </div>
        <div>
          <h2 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-color)' }}>Historique</h2>
          <p className="opacity-50 font-bold" style={{ color: 'var(--text-color)' }}>Retrouvez vos préparations enregistrées.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-40 bg-white/5 border-2 border-white/10 border-dashed rounded-[4rem] text-center flex flex-col items-center">
          <FileText size={64} className="opacity-10 mb-6" />
          <p className="text-2xl font-black opacity-30">Aucun historique pour le moment</p>
          <p className="mt-2 opacity-20 font-bold">Générez une étude pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {history.map((study) => (
            <div
              key={study.id}
              onClick={() => setSelectedStudy(study)}
              className="bg-white/5 border border-white/10 rounded-[3rem] p-10 hover:bg-white/10 transition-all cursor-pointer group shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-lg">
                  {study.type === 'WATCHTOWER' ? <BookOpen size={28} /> : <Calendar size={28} />}
                </div>
                <button 
                  onClick={(e) => handleDelete(study.id, e)} 
                  className="p-3 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
                >
                  <Trash2 size={22} />
                </button>
              </div>
              <h3 className="font-black text-2xl mb-6 leading-tight line-clamp-2" style={{ color: 'var(--text-color)' }}>{study.title}</h3>
              <div className="flex items-center space-x-3 text-[11px] font-black uppercase tracking-widest opacity-40" style={{ color: 'var(--text-color)' }}>
                <span className="px-3 py-1 bg-white/5 rounded-md">{study.type === 'WATCHTOWER' ? 'Tour de Garde' : 'Ministère'}</span>
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
