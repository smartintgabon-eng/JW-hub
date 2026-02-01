
import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  Share2, 
  ChevronLeft,
  FileText,
  Printer,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2
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
    if (window.confirm("Supprimer définitivement ?")) {
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
      alert("Étude complétée et mise à jour !");
    } catch (err) {
      alert("Erreur lors de la régénération.");
    } finally {
      setIsRegenerating(false);
    }
  };

  if (selectedStudy) {
    return (
      <div className={`animate-in fade-in slide-in-from-right-4 duration-500 pb-24 ${readingMode ? 'fixed inset-0 z-[100] bg-[var(--bg-color)] overflow-y-auto p-6 md:p-20' : ''}`}>
        <div className={`flex items-center justify-between mb-8 sticky top-0 py-2 z-20 bg-[var(--bg-color)] border-b border-white/5 ${readingMode ? 'max-w-4xl mx-auto' : ''} print:hidden`}>
          <button onClick={() => { setSelectedStudy(null); setReadingMode(false); }} className="flex items-center space-x-2 opacity-60 hover:opacity-100 transition-all">
            <ChevronLeft size={20} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Retour</span>
          </button>
          <div className="flex items-center space-x-2">
             <button onClick={() => setReadingMode(!readingMode)} className="p-2 bg-white/5 rounded-lg border border-white/10" title="Mode Lecture">
                {readingMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
             </button>
             <button onClick={() => handleRegenerate(selectedStudy)} disabled={isRegenerating} className="p-2 bg-white/5 rounded-lg border border-white/10 text-blue-400" title="Régénérer/Compléter">
                {isRegenerating ? <Loader2 size={18} className="animate-spin"/> : <RefreshCw size={18} />}
             </button>
             <button onClick={() => window.print()} className="p-2 bg-white/5 rounded-lg border border-white/10" title="Exporter PDF">
                <Printer size={18} />
             </button>
             <button onClick={(e) => handleDelete(selectedStudy.id, e)} className="p-2 bg-white/5 rounded-lg border border-white/10 text-red-400">
                <Trash2 size={18} />
             </button>
          </div>
        </div>

        <article className={`max-w-4xl mx-auto ${readingMode ? 'pt-10' : ''} print:p-0`}>
          <header className="mb-12 text-center">
             <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 inline-block print:bg-black print:text-white">
                {selectedStudy.type === 'WATCHTOWER' ? 'Tour de Garde' : 'Vie et Ministère'}
             </div>
             <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">{selectedStudy.title}</h1>
             <p className="opacity-40 text-[10px] font-bold uppercase tracking-widest">Préparé le {selectedStudy.date}</p>
          </header>

          <div className="space-y-8 font-serif text-lg leading-relaxed print:text-black">
            {selectedStudy.content.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (trimmed.includes('PARAGRAPHE')) return <h3 key={idx} className="text-2xl font-bold pt-10 border-t border-white/5 mt-10" style={{ color: 'var(--btn-color)' }}>{trimmed}</h3>;
              if (trimmed.startsWith('VERSET')) return <div key={idx} className="p-6 bg-white/5 border-l-4 border-[var(--btn-color)] italic rounded-r-xl my-4 print:bg-gray-100">{trimmed}</div>;
              if (trimmed.startsWith('RÉPONSE') || trimmed.startsWith('COMMENTAIRE')) return <p key={idx} className="mt-4"><span className="font-bold uppercase text-[9px] mr-2 px-2 py-0.5 bg-[var(--btn-color)] text-[var(--btn-text)] rounded">{trimmed.split(':')[0]}</span>{trimmed.split(':').slice(1).join(':')}</p>;
              return <p key={idx} className="opacity-80">{trimmed}</p>;
            })}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-lg">
          <HistoryIcon size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Historique</h2>
          <p className="opacity-50 text-sm">Vos études enregistrées hors ligne.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="py-20 bg-white/5 border-2 border-dashed border-white/5 rounded-3xl text-center">
          <FileText size={48} className="mx-auto opacity-10 mb-4" />
          <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Aucune archive trouvée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((study) => (
            <div key={study.id} onClick={() => setSelectedStudy(study)} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer group relative overflow-hidden shadow-lg">
              <h3 className="font-bold text-lg mb-4 line-clamp-1">{study.title}</h3>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold uppercase tracking-widest opacity-40">{study.date}</span>
                <button onClick={(e) => handleDelete(study.id, e)} className="p-2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
