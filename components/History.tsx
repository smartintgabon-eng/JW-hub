
import React, { useState } from 'react';
import { 
  History as HistoryIcon, 
  Trash2, 
  Share2, 
  Download, 
  ChevronRight, 
  ChevronLeft,
  Search,
  BookOpen,
  Calendar,
  FileText,
  Home as HomeIcon
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
    if (window.confirm("Voulez-vous vraiment supprimer cette étude ?")) {
      deleteFromHistory(id);
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      if (selectedStudy?.id === id) {
        setSelectedStudy(null);
      }
    }
  };

  const handleShare = async (study: GeneratedStudy, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareText = `${study.title}\n\n${study.content}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: study.title,
          text: shareText,
        });
      } catch (err) {
        console.log("Share failed", err);
      }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Copié dans le presse-papiers !");
    }
  };

  const handleDownload = (study: GeneratedStudy) => {
    const blob = new Blob([study.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${study.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (selectedStudy) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 sticky top-0 bg-zinc-950/90 backdrop-blur-md py-4 z-10 border-b border-zinc-800 px-2 md:px-0">
          <button 
            onClick={() => setSelectedStudy(null)}
            className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-all group"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Retour</span>
          </button>
          <div className="flex items-center space-x-2">
             <button 
               onClick={(e) => handleShare(selectedStudy, e)} 
               className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-blue-400 transition-all"
               title="Partager"
             >
                <Share2 size={20} />
             </button>
             <button 
               onClick={() => handleDownload(selectedStudy)} 
               className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-green-400 transition-all"
               title="Télécharger"
             >
                <Download size={20} />
             </button>
             <button 
               onClick={(e) => handleDelete(selectedStudy.id, e)} 
               className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:text-red-400 transition-all"
               title="Supprimer"
             >
                <Trash2 size={20} />
             </button>
          </div>
        </div>

        <article className="bg-zinc-900/30 border border-zinc-800/50 rounded-[2.5rem] p-6 md:p-10 shadow-2xl mb-10 overflow-hidden">
          <header className="mb-12 text-center">
             <div className="flex items-center justify-center space-x-3 text-blue-500 mb-6">
                <span className="text-xs font-black uppercase tracking-[0.2em] px-4 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                  {selectedStudy.type === 'WATCHTOWER' ? 'Tour de Garde' : 'Cahier'}
                </span>
                <span className="text-sm text-zinc-400 font-bold">{selectedStudy.date}</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">{selectedStudy.title}</h1>
          </header>

          <div className="space-y-10 text-zinc-300 leading-relaxed whitespace-pre-wrap font-serif text-lg md:text-xl">
            {selectedStudy.content.split('\n').map((line, idx) => {
              if (line.match(/^\d+\./)) {
                return <h3 key={idx} className="text-2xl font-black text-white pt-10 border-t border-zinc-800/50 mt-10 first:mt-0 first:pt-0 first:border-0">{line}</h3>;
              }
              if (line.includes('Réponse') || line.includes('Commentaire') || line.includes('Application') || line.includes('Leçon')) {
                return <p key={idx} className="font-black text-zinc-100 mt-4 underline decoration-blue-500/30 decoration-4 underline-offset-4">{line}</p>;
              }
              if (line.trim().startsWith('-')) {
                return <div key={idx} className="flex space-x-4 pl-4"><span className="text-blue-500 font-black">•</span><span className="flex-1">{line.trim().substring(1).trim()}</span></div>;
              }
              return <p key={idx}>{line}</p>;
            })}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between gap-4 mb-10">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-blue-400 shadow-xl">
            <HistoryIcon size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">Historique</h2>
            <p className="text-zinc-500 font-medium">Réponses et recherches sauvegardées.</p>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-zinc-900/30 border border-zinc-800 border-dashed rounded-[3rem] text-zinc-600">
          <FileText size={48} className="opacity-20 mb-6" />
          <p className="text-xl font-bold mb-2">Aucun historique</p>
          <p className="text-sm text-center">Générez une étude pour la voir ici.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((study) => (
            <div
              key={study.id}
              onClick={() => setSelectedStudy(study)}
              className="group bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 hover:border-blue-500/30 hover:bg-zinc-800 transition-all cursor-pointer flex flex-col justify-between shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl shrink-0 ${study.type === 'WATCHTOWER' ? 'bg-indigo-600/10 text-indigo-400' : 'bg-blue-600/10 text-blue-400'}`}>
                  {study.type === 'WATCHTOWER' ? <BookOpen size={24} /> : <Calendar size={24} />}
                </div>
                <div className="flex space-x-1">
                  <button onClick={(e) => handleShare(study, e)} className="p-2 text-zinc-500 hover:text-blue-400 transition-all"><Share2 size={18} /></button>
                  <button onClick={(e) => handleDelete(study.id, e)} className="p-2 text-zinc-500 hover:text-red-400 transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-black text-xl text-zinc-200 line-clamp-2 leading-tight">{study.title}</h3>
                <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest text-zinc-500">
                  <span>{study.date}</span>
                </div>
              </div>
              <div className="mt-6 flex items-center text-blue-500 font-bold text-sm">
                <span>Lire l'étude</span>
                <ChevronRight size={16} className="ml-1" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
