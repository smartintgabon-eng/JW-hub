import React, { useState, useEffect } from 'react';
import { GeneratedStudy } from '../types';
import { getHistory, deleteStudy } from '../utils/storage.ts';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import jsPDF from 'jspdf';
import { Clock, Trash2, FileText, Download, Search, ChevronRight } from 'lucide-react';
import Markdown from 'react-markdown';

const History: React.FC = () => {
  const [history, setHistory] = useState<GeneratedStudy[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<GeneratedStudy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Supprimer définitivement cette étude ?')) {
      deleteStudy(id);
      loadHistory();
      if (selectedStudy?.id === id) setSelectedStudy(null);
    }
  };

  const exportToDocx = (study: GeneratedStudy) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: study.title,
                bold: true,
                size: 32,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: study.content,
                size: 24,
              }),
            ],
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${study.title}.docx`);
    });
  };

  const exportToPdf = (study: GeneratedStudy) => {
    const doc = new jsPDF();
    doc.text(study.title, 10, 10);
    const splitText = doc.splitTextToSize(study.content, 180);
    doc.text(splitText, 10, 20);
    doc.save(`${study.title}.pdf`);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-in fade-in duration-500 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
          <Clock className="text-blue-500" size={36} />
          Historique Complet
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Sidebar Liste */}
        <div className="lg:col-span-1 flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-zinc-800 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-600 focus:border-blue-600 outline-none transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {['all', 'cahier_vie_et_ministere', 'tour_de_garde', 'predication_porte_en_porte', 'recherches'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-colors ${filterCategory === cat ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-300'}`}
                >
                  {cat === 'all' ? 'Tout' : cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-sm">Aucun résultat trouvé.</div>
            ) : (
              filteredHistory.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedStudy(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${selectedStudy?.id === item.id ? 'bg-blue-600/10 border-blue-600/50' : 'bg-black/20 border-transparent hover:bg-zinc-800/50 hover:border-zinc-800'}`}
                >
                  <div className="pr-8">
                    <h4 className={`font-bold text-sm truncate ${selectedStudy?.id === item.id ? 'text-blue-400' : 'text-zinc-300 group-hover:text-white'}`}>{item.title}</h4>
                    <p className="text-xs text-zinc-600 mt-1 flex items-center gap-2">
                      <span>{item.date}</span>
                      <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                      <span className="uppercase tracking-wider text-[10px]">{item.category.replace(/_/g, ' ')}</span>
                    </p>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(item.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                  {selectedStudy?.id === item.id && (
                    <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Contenu Principal */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl overflow-y-auto relative">
          {selectedStudy ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10 pt-2">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{selectedStudy.title}</h3>
                  <p className="text-sm text-zinc-500 font-mono">{selectedStudy.date} • {selectedStudy.category.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => exportToDocx(selectedStudy)}
                    className="p-2 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    title="Exporter en Word"
                  >
                    <FileText size={18} /> <span className="hidden sm:inline">DOCX</span>
                  </button>
                  <button 
                    onClick={() => exportToPdf(selectedStudy)}
                    className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
                    title="Exporter en PDF"
                  >
                    <Download size={18} /> <span className="hidden sm:inline">PDF</span>
                  </button>
                </div>
              </div>
              
              <div className="markdown-body prose prose-invert max-w-none prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-black prose-p:text-zinc-300 prose-strong:text-white">
                <Markdown>{selectedStudy.content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-600">
                <FileText size={48} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold mb-2 text-zinc-400 uppercase tracking-widest">Sélectionnez une étude</h3>
              <p className="max-w-md text-zinc-600">Cliquez sur un élément dans la liste de gauche pour voir les détails et les options d'export.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
