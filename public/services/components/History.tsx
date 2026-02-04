
import React, { useState, useEffect } from 'react';
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
  Download,
  FileSignature
} from 'lucide-react';
import { GeneratedStudy, AppSettings, StudyPart } from '../types'; 
import { deleteFromHistory, saveToHistory } from '../utils/storage'; 
import { generateStudyContent } from '../services/geminiService'; 

// Importations pour la génération de documents
import saveAs from 'file-saver'; 
import { Document, Paragraph, TextRun, Packer, HeadingLevel, AlignmentType } from 'docx';
import jsPDF from 'jspdf';


interface Props {
  history: GeneratedStudy[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedStudy[]>>;
  settings: AppSettings;
}

const History: React.FC<Props> = ({ history, setHistory, settings }) => {
  const [selectedStudy, setSelectedStudy] = useState<GeneratedStudy | null>(null);
  const [readingMode, setReadingMode] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Gérer la classe CSS pour le mode lecture sur le body
  useEffect(() => {
    if (readingMode) {
      document.body.classList.add('reading-mode-active');
    } else {
      document.body.classList.remove('reading-mode-active');
    }
    return () => {
      document.body.classList.remove('reading-mode-active');
    };
  }, [readingMode]);

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
      // Pour la régénération, on utilise le type et l'input original, et la partie si elle était définie
      const result = await generateStudyContent(study.type, study.url || study.title, study.part || 'tout', settings);
      const updatedStudy = { ...study, content: result.text, timestamp: Date.now() };
      saveToHistory(updatedStudy); // Met à jour l'historique
      setHistory(prev => prev.map(h => h.id === study.id ? updatedStudy : h));
      setSelectedStudy(updatedStudy); // Met à jour l'étude affichée
      alert("Étude complétée avec succès !");
    } catch (err) {
      console.error("Erreur lors de la régénération:", err);
      alert("Erreur lors de la régénération. Vérifiez votre connexion ou les quotas API.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const formatContentForExport = (content: string, type: 'WATCHTOWER' | 'MINISTRY', title: string, date: string): string => {
    let formatted = `# ${title}\n\n`;
    if (type === 'WATCHTOWER') {
      formatted += `**Étude de la Tour de Garde - ${date}**\n\n`;
    } else {
      formatted += `**Cahier Vie et Ministère - ${date}**\n\n`;
    }
    formatted += content;
    return formatted;
  };

  const exportToDocx = async (study: GeneratedStudy) => {
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({
            text: study.title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
          }),
          new Paragraph({
            text: study.type === 'WATCHTOWER' ? `Étude de la Tour de Garde - ${study.date}` : `Cahier Vie et Ministère - ${study.date}`,
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            style: 'Strong',
          }),
          ...study.content.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed) return new Paragraph({});
            // Fix: Changed HeadingLevel.HEADING1 to HeadingLevel.HEADING_1
            if (trimmed.startsWith('#')) return new Paragraph({ text: trimmed.substring(1).trim(), heading: HeadingLevel.HEADING_1, spacing: { before: 240, after: 120 } });
            if (trimmed.startsWith('Thème:')) return new Paragraph({ text: trimmed, style: 'Intense Quote', spacing: { after: 240 } });
            if (trimmed.includes('PARAGRAPHE')) {
                return new Paragraph({
                    children: [new TextRun({ text: trimmed, bold: true, color: settings.buttonColor.replace('#', '') })],
                    spacing: { before: 360, after: 120 },
                });
            }
            if (trimmed.startsWith('VERSET')) {
              return new Paragraph({
                children: [new TextRun({ text: trimmed, italics: true })],
                border: { left: { color: settings.buttonColor.replace('#', ''), size: 24, style: 'single' } },
                indent: { left: 360 },
                spacing: { before: 120, after: 120 },
              });
            }
            if (trimmed.startsWith('QUESTION') || trimmed.startsWith('RÉPONSE') || trimmed.startsWith('COMMENTAIRE') || trimmed.startsWith('APPLICATION')) {
                const [label, ...rest] = trimmed.split(':');
                return new Paragraph({
                  children: [
                    new TextRun({ text: `${label}: `, bold: true, color: settings.buttonColor.replace('#', ''), size: 20 }),
                    new TextRun({ text: rest.join(':').trim(), size: 20 }),
                  ],
                  spacing: { after: 60 },
                });
            }
            if (trimmed.startsWith('- Quelle leçon')) { // Nouvelle détection pour les questions d'application
              return new Paragraph({
                children: [new TextRun({ text: trimmed, italics: true, size: 18 })],
                spacing: { before: 60, after: 60 },
                indent: { left: 240 },
              });
            }
            return new Paragraph({ text: trimmed, spacing: { after: 60 } });
          })
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }), `${study.title}.docx`);
  };

  const exportToPdf = (study: GeneratedStudy) => {
    const doc = new jsPDF();
    let y = 10;
    const margin = 10;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Set font for better rendering of French characters
    doc.setFont('helvetica');

    // Title
    doc.setFontSize(24);
    doc.text(study.title, pageWidth / 2, y + 10, { align: 'center' });
    y += 20;

    // Type and Date
    doc.setFontSize(12);
    doc.text(study.type === 'WATCHTOWER' ? `Étude de la Tour de Garde - ${study.date}` : `Cahier Vie et Ministère - ${study.date}`, pageWidth / 2, y + 5, { align: 'center' });
    y += 15;

    doc.setFontSize(11);
    const lines = study.content.split('\n');

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }

      if (trimmed.startsWith('#')) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(trimmed.substring(1).trim(), margin, y);
        y += 7;
      } else if (trimmed.startsWith('Thème:')) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        doc.text(trimmed, margin, y);
        y += 7;
      } else if (trimmed.includes('PARAGRAPHE')) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(settings.buttonColor || '#4a70b5');
        doc.text(trimmed, margin, y);
        y += 7;
        doc.setTextColor(0, 0, 0); // Reset color
      } else if (trimmed.startsWith('VERSET')) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        const textLines = doc.splitTextToSize(trimmed, pageWidth - 2 * margin - 10);
        doc.text(textLines, margin + 5, y); // Small indent for verses
        y += (textLines.length * 5) + 3;
      } else if (trimmed.startsWith('QUESTION') || trimmed.startsWith('RÉPONSE') || trimmed.startsWith('COMMENTAIRE') || trimmed.startsWith('APPLICATION')) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const [label, ...rest] = trimmed.split(':');
        doc.setTextColor(settings.buttonColor || '#4a70b5');
        doc.text(`${label}: `, margin, y);
        doc.setTextColor(0, 0, 0); // Reset color
        doc.setFont('helvetica', 'normal');
        // Fix: Changed doc.internal.getFontSize() to doc.getFontSize()
        const textLines = doc.splitTextToSize(rest.join(':').trim(), pageWidth - 2 * margin - doc.getStringUnitWidth(`${label}: `) * doc.getFontSize());
        // Fix: Changed doc.internal.getFontSize() to doc.getFontSize()
        doc.text(textLines, margin + doc.getStringUnitWidth(`${label}: `) * doc.getFontSize(), y, { align: 'left' });
        y += (textLines.length * 5) + 3;
      } else if (trimmed.startsWith('- Quelle leçon')) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const textLines = doc.splitTextToSize(trimmed, pageWidth - 2 * margin - 10);
        doc.text(textLines, margin + 5, y);
        y += (textLines.length * 5) + 2;
      }
      else {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        const textLines = doc.splitTextToSize(trimmed, pageWidth - 2 * margin);
        doc.text(textLines, margin, y);
        y += (textLines.length * 5) + 3;
      }
      y += 2; // Extra spacing between lines
    });

    doc.save(`${study.title}.pdf`);
  };

  if (selectedStudy) {
    return (
      <div className={`animate-in fade-in slide-in-from-right-4 duration-500 pb-24 ${readingMode ? 'fixed inset-0 z-[100] bg-[var(--bg-color)] overflow-y-auto p-0 md:p-0' : ''}`}>
        <div className={`flex items-center justify-between mb-10 sticky top-0 py-4 z-20 bg-[var(--bg-color)] border-b border-white/5 ${readingMode ? 'max-w-4xl mx-auto px-6' : ''} print:hidden`}>
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
             <button onClick={() => exportToDocx(selectedStudy)} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10" title="Télécharger en DOCX">
                <FileSignature size={20} />
             </button>
             <button onClick={() => exportToPdf(selectedStudy)} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10" title="Télécharger en PDF">
                <Download size={20} />
             </button>
             <button onClick={() => window.print()} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10" title="Imprimer / PDF">
                <Printer size={20} />
             </button>
             <button onClick={(e) => handleDelete(selectedStudy.id, e)} className="p-3 bg-white/5 rounded-xl border border-white/10 text-red-400 hover:bg-white/10">
                <Trash2 size={20} />
             </button>
          </div>
        </div>

        <article className={`max-w-4xl mx-auto ${readingMode ? 'pt-10 px-6' : ''} print:p-0 print:text-black`}>
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
              if (trimmed.startsWith('#')) return <h3 key={idx} className="text-3xl font-black pt-12 border-t border-white/10 mt-12 uppercase tracking-tight" style={{ color: 'var(--btn-color)' }}>{trimmed.substring(1).trim()}</h3>;
              if (trimmed.includes('PARAGRAPHE')) {
                return <h3 key={idx} className="text-3xl font-black pt-12 border-t border-white/10 mt-12 uppercase tracking-tight" style={{ color: 'var(--btn-color)' }}>{trimmed}</h3>;
              }
              if (trimmed.startsWith('VERSET')) {
                return <div key={idx} className="p-8 bg-white/5 border-l-8 border-[var(--btn-color)] italic rounded-r-3xl my-8 print:border-black print:bg-gray-100">{trimmed}</div>;
              }
              if (trimmed.startsWith('QUESTION') || trimmed.startsWith('RÉPONSE') || trimmed.startsWith('COMMENTAIRE') || trimmed.startsWith('APPLICATION')) {
                const [label, ...rest] = trimmed.split(':');
                return (
                  <div key={idx} className="space-y-2">
                    <span className="inline-block px-3 py-1 bg-[var(--btn-color)] text-[var(--btn-text)] text-[10px] font-black uppercase tracking-widest rounded-md">{label}</span>
                    <p className="font-sans font-bold text-lg opacity-90">{rest.join(':').trim()}</p>
                  </div>
                );
              }
              if (trimmed.startsWith('- Quelle leçon')) {
                return <p key={idx} className="opacity-60 font-sans italic pt-4">{trimmed}</p>;
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
              <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mb-4">{study.type} {study.part && `- ${study.part.toUpperCase()}`}</div>
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