
import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  ChevronLeft,
  FileText,
  Printer,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2,
  Download
} from 'lucide-react';
import { GeneratedStudy, AppSettings } from '../types';
import { deleteFromHistory, saveToHistory } from '../utils/storage';
import { generateStudyContent } from '../services/geminiService';

interface Props {
  history: GeneratedStudy[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedStudy[]>>;
  settings: AppSettings;
}

const History: React.FC<Props> = ({ history, setHistory, settings }) => {
  const [selectedStudy, setSelectedStudy] = useState<GeneratedStudy | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Voulez-vous supprimer cette étude ?")) {
      deleteFromHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedStudy?.id === id) setSelectedStudy(null);
    }
  };

  const handleRegenerate = async (study: GeneratedStudy) => {
    setIsRegenerating(true);
    try {
      const result = await generateStudyContent(study.type, study.url || study.title, 'tout', settings);
      const updatedStudy = { ...study, content: result.text, timestamp: Date.now() };
      saveToHistory(updatedStudy);
      setHistory(prev => prev.map(h => h.id === study.id ? updatedStudy : h));
      setSelectedStudy(updatedStudy);
      alert("Étude complétée avec succès !");
    } catch (err) {
      alert("Erreur lors de la régénération.");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (selectedStudy) {
    return (
      <div className={`animate-in fade-in slide-in-from-right-4 duration-500 pb-24 ${readingMode ? 'fixed inset-0 z-[100] bg-[var(--bg-color)] overflow-y-auto p-6 md:p-24' : ''}`}>
        <div className={`flex items-center justify-between mb-10 sticky top-0 py-4 z-20 bg-[var(--bg-color)] border-b border-white/5 ${readingMode ? 'max-w-4xl mx-auto' : ''} print:hidden`}>
          <button onClick={() => { setSelectedStudy(null); setReadingMode(false); }} className="flex items-center space-x-3 opacity-60 hover:opacity-100 transition-all group">
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Fermer</span>
          </button>
          <div className="flex items-center space-x-3">
             <button onClick={() => setReadingMode(!readingMode)} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10" title="Mode Lecture">
                {readingMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
             </button>
             <button onClick={() => handleRegenerate(selectedStudy)} disabled={isRegenerating} className="p-3 bg-white/5 rounded-xl border border-white/10 text-blue-400 hover:bg-white/10" title="Régénérer les réponses">
                {isRegenerating ? <Loader2 size={20} className="animate-spin"/> : <RefreshCw size={20} />}
             </button>
             <button onClick={() => window.print()} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10" title="Imprimer / PDF">
                <Printer size={20} />
             </button>
             <button onClick={(e) => handleDelete(selectedStudy.id, e)} className="p-3 bg-white/5 rounded-xl border border-white/10 text-red-400 hover:bg-white/10">
                <Trash2 size={20} />
             </button>
          </div>
        </div>

        <article className={`max-w-4xl mx-auto ${readingMode ? 'pt-10' : ''} print:p-0 print:text-black`}>
          <header className="mb-16 text-center">
             <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="text-[10px] font-black uppercase tracking-[0.4em] px-6 py-2 rounded-full mb-8 inline-block shadow-lg">
                {selectedStudy.type === 'WATCHTOWER' ? 'Étude de la Tour de Garde' : 'Vie et Ministère'}
             </div>
             <h1 className="text-4xl md:text-6xl font-black leading-none mb-6 tracking-tighter uppercase">{selectedStudy.title}</h1>
             <p className="opacity-30 text-xs font-black uppercase tracking-[0.5em]">Mis à jour le {selectedStudy.date}</p>
          </header>

          <div className="space-y-10 font-serif text-xl leading-relaxed print:text-lg">
            {selectedStudy.content.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.includes('PARAGRAPHE')) {
                return <h3 key={idx} className="text-3xl font-black pt-12 border-t border-white/10 mt-12 uppercase tracking-tight" style={{ color: 'var(--btn-color)' }}>{trimmed}</h3>;
              }
              if (trimmed.startsWith('VERSET')) {
                return <div key={idx} className="p-8 bg-white/5 border-l-8 border-[var(--btn-color)] italic rounded-r-3xl my-8 print:border-black print:bg-gray-100">{trimmed}</div>;
              }
              if (trimmed.startsWith('RÉPONSE') || trimmed.startsWith('COMMENTAIRE') || trimmed.startsWith('APPLICATION')) {
                const [label, ...rest] = trimmed.split(':');
                return (
                  <div key={idx} className="space-y-2">
                    <span className="inline-block px-3 py-1 bg-[var(--btn-color)] text-[var(--btn-text)] text-[10px] font-black uppercase tracking-widest rounded-md">{label}</span>
                    <p className="font-sans font-bold text-lg opacity-90">{rest.join(':').trim()}</p>
                  </div>
                );
              }
              return <p key={idx} className="opacity-60 font-sans">{trimmed}</p>;
            })}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-xl">
          <HistoryIcon size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Historique</h2>
          <p className="opacity-40 text-sm font-bold tracking-wide">Accès hors ligne à vos préparations.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-24 bg-white/5 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
          <FileText size={56} className="mx-auto opacity-10 mb-6" />
          <p className="text-sm font-black opacity-20 uppercase tracking-[0.3em]">Aucune archive disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {history.map((study) => (
            <div key={study.id} onClick={() => setSelectedStudy(study)} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden shadow-xl active:scale-[0.98]">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => handleDelete(study.id, e)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 size={18}/></button>
              </div>
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-4">{study.type}</div>
              <h3 className="font-black text-2xl mb-6 line-clamp-2 leading-tight uppercase tracking-tight">{study.title}</h3>
              <div className="flex justify-between items-center mt-auto pt-6 border-t border-white/5">
                <span className="text-[10px] font-bold opacity-30">{study.date}</span>
                <span className="text-[10px] font-black uppercase text-[var(--btn-color)] group-hover:translate-x-1 transition-transform tracking-widest">Ouvrir →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
