
import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  Share2, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  FileText,
  BookOpen,
  Calendar
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
    if (window.confirm("Supprimer cette étude ?")) {
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
      alert("Copié !");
    }
  };

  if (selectedStudy) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between mb-8 sticky top-0 py-4 z-10 border-b border-white/10 px-2 bg-[var(--bg-color)]">
          <button onClick={() => setSelectedStudy(null)} className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-all">
            <ChevronLeft size={24} />
            <span className="font-bold">Retour</span>
          </button>
          <div className="flex items-center space-x-2">
             <button onClick={(e) => handleShare(selectedStudy, e)} className="p-3 bg-white/5 rounded-xl"><Share2 size={20} /></button>
             <button onClick={(e) => handleDelete(selectedStudy.id, e)} className="p-3 bg-white/5 rounded-xl hover:text-red-400"><Trash2 size={20} /></button>
          </div>
        </div>

        <article className="bg-white/5 rounded-[3rem] p-6 md:p-12 shadow-2xl overflow-hidden border border-white/10">
          <header className="mb-12 text-center">
             <span style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6 inline-block">
                {selectedStudy.type === 'WATCHTOWER' ? 'La Tour de Garde' : 'Vie et Ministère'}
             </span>
             <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mb-4">{selectedStudy.title}</h1>
             <p className="opacity-50 font-bold">{selectedStudy.date}</p>
          </header>

          <div className="space-y-12 leading-relaxed whitespace-pre-wrap font-serif text-lg md:text-2xl">
            {selectedStudy.content.split('\n').map((line, idx) => {
              if (line.includes('PARAGRAPHE') || line.includes('RÉVISION')) {
                return <h3 key={idx} className="text-2xl md:text-3xl font-black pt-12 border-t border-white/10 mt-12 first:mt-0 first:pt-0 first:border-0">{line}</h3>;
              }
              if (line.startsWith('VERSET')) {
                return <div key={idx} className="p-6 bg-white/5 rounded-2xl border-l-4 border-[var(--btn-color)] italic font-sans text-base opacity-90">{line}</div>;
              }
              if (line.startsWith('RÉPONSE') || line.startsWith('COMMENTAIRE') || line.startsWith('APPLICATION')) {
                return <p key={idx} className="font-black mt-6" style={{ color: 'var(--btn-color)' }}>{line}</p>;
              }
              return <p key={idx} className="opacity-90">{line}</p>;
            })}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-10">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-xl">
          <HistoryIcon size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-black">Historique</h2>
          <p className="opacity-60 font-medium">Vos études enregistrées.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-32 bg-white/5 border-2 border-white/10 border-dashed rounded-[3rem] text-center flex flex-col items-center">
          <FileText size={48} className="opacity-20 mb-4" />
          <p className="text-xl font-bold opacity-40">Aucune étude enregistrée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((study) => (
            <div
              key={study.id}
              onClick={() => setSelectedStudy(study)}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all cursor-pointer group shadow-xl"
            >
              <div className="flex justify-between items-start mb-6">
                <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-3 rounded-xl">
                  {study.type === 'WATCHTOWER' ? <BookOpen size={24} /> : <Calendar size={24} />}
                </div>
                <button onClick={(e) => handleDelete(study.id, e)} className="p-2 opacity-30 hover:opacity-100 hover:text-red-400 transition-all"><Trash2 size={20} /></button>
              </div>
              <h3 className="font-black text-xl mb-4 leading-tight line-clamp-2">{study.title}</h3>
              <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                <span>{study.type === 'WATCHTOWER' ? 'Tour de Garde' : 'Ministère'}</span>
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
