
import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  Share2, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  ExternalLink,
  Search,
  // Added missing icon imports
  BookOpen,
  Calendar
} from 'lucide-react';
import { GeneratedStudy } from '../types';
import { deleteFromHistory } from '../utils/storage';

interface Props {
  history: GeneratedStudy[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedStudy[]>>;
}

const History: React.FC<Props> = ({ history, setHistory }) => {
  const [selectedStudy, setSelectedStudy] = useState<GeneratedStudy | null>(null);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer cette réponse ?")) {
      deleteFromHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedStudy?.id === id) setSelectedStudy(null);
    }
  };

  const handleShare = async (study: GeneratedStudy, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.share({
        title: study.title,
        text: study.content,
        url: study.url
      });
    } catch (err) {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(study.content);
      alert("Contenu copié dans le presse-papiers !");
    }
  };

  const handleDownload = (study: GeneratedStudy) => {
    const blob = new Blob([study.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${study.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (selectedStudy) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-zinc-950/80 backdrop-blur-md py-4 z-10 border-b border-zinc-800 px-2 md:px-0">
          <button 
            onClick={() => setSelectedStudy(null)}
            className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour</span>
          </button>
          <div className="flex items-center space-x-3">
             <button onClick={() => handleShare(selectedStudy, {} as any)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-blue-400 hover:border-blue-500/30 transition-all">
                <Share2 size={18} />
             </button>
             <button onClick={() => handleDownload(selectedStudy)} className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-green-400 hover:border-green-500/30 transition-all">
                <Download size={18} />
             </button>
          </div>
        </div>

        <article className="prose prose-invert prose-zinc max-w-none pb-20">
          <header className="mb-10 text-center">
             <div className="flex items-center justify-center space-x-2 text-blue-500 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 bg-blue-500/10 rounded-full">{selectedStudy.type === 'WATCHTOWER' ? 'Tour de Garde' : 'Vie et Ministère'}</span>
                <span className="text-xs font-medium text-zinc-500">•</span>
                <span className="text-xs text-zinc-500 font-medium">{selectedStudy.date}</span>
             </div>
             <h1 className="text-3xl md:text-4xl font-black text-zinc-100 leading-tight">{selectedStudy.title}</h1>
          </header>

          <div className="space-y-8 text-zinc-300 leading-relaxed whitespace-pre-wrap font-serif text-lg">
            {selectedStudy.content.split('\n').map((line, idx) => {
              // Custom styling based on content
              if (line.match(/^\d+\./)) return <h3 key={idx} className="text-xl font-bold text-zinc-100 pt-6 border-t border-zinc-800">{line}</h3>;
              if (line.includes('Réponses (Informations Clés)')) return <p key={idx} className="italic text-zinc-400 font-medium">{line}</p>;
              if (line.includes('Commentaires') || line.includes('Applications')) return <p key={idx} className="font-bold text-zinc-200 mt-4 underline decoration-blue-500/40">{line}</p>;
              if (line.startsWith('-')) return <div key={idx} className="flex space-x-3 pl-4">
                  <span className="text-blue-500 mt-1.5 shrink-0">•</span>
                  <span>{line.replace(/^- /, '')}</span>
                </div>;
              return <p key={idx}>{line}</p>;
            })}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-8">
        <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl text-blue-400">
          <HistoryIcon size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Historique</h2>
          <p className="text-zinc-500 text-sm">Vos réponses générées enregistrées localement.</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-3xl text-zinc-500">
          <Search size={48} className="mb-4 opacity-20" />
          <p className="text-lg">Aucun historique trouvé</p>
          <p className="text-sm">Générez votre première étude pour commencer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {history.map((study) => (
            <div
              key={study.id}
              onClick={() => setSelectedStudy(study)}
              className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-600 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-4 overflow-hidden">
                <div className={`p-3 rounded-xl shrink-0 ${study.type === 'WATCHTOWER' ? 'bg-indigo-600/10 text-indigo-400' : 'bg-blue-600/10 text-blue-400'}`}>
                  {study.type === 'WATCHTOWER' ? <BookOpen size={20} /> : <Calendar size={20} />}
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-zinc-200 truncate group-hover:text-blue-400 transition-colors">{study.title}</h3>
                  <p className="text-xs text-zinc-500 flex items-center space-x-2 mt-1">
                    <span>{study.date}</span>
                    <span>•</span>
                    <span className="uppercase">{study.type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier Vie et Ministère'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button 
                  onClick={(e) => handleShare(study, e)}
                  className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-zinc-800 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                >
                  <Share2 size={18} />
                </button>
                <button 
                  onClick={(e) => handleDelete(study.id, e)}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
                <ChevronRight className="text-zinc-700 group-hover:text-zinc-300 transition-colors" size={20} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
