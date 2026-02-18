import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Trash2, ChevronLeft, ChevronRight, FileText, Printer, Maximize2, Minimize2, 
  RefreshCw, Loader2, Download, FileSignature, Search, Globe, Link as LinkIcon 
} from 'lucide-react';
import { GeneratedStudy, AppSettings, StudyPart } from '../types'; 
import { deleteFromHistory, saveToHistory } from '../utils/storage'; 
import saveAs from 'file-saver'; 
import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } from 'docx'; // Added HeadingLevel
import jsPDF from 'jspdf';

interface Props {
  history: GeneratedStudy[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedStudy[]>>;
  settings: AppSettings;
}

const History: React.FC<Props> = ({ history, setHistory, settings }) => {
  const [selectedStudy, setSelectedStudy] = useState<GeneratedStudy | null>(null);
  const [readingMode, setReadingMode] = useState(false);

  useEffect(() => {
    if (readingMode) document.body.classList.add('reading-mode-active');
    else document.body.classList.remove('reading-mode-active');
  }, [readingMode]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Voulez-vous supprimer cette étude ?")) {
      deleteFromHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedStudy?.id === id) setSelectedStudy(null);
    }
  };

  // Helper for DOCX to format text with Markdown-like bold/italic
  const formatTextRunForDocx = (text: string, defaultTextColor: string) => {
    const children: TextRun[] = [];
    const boldItalicRegex = /\*\*\*(.*?)\*\*\*/g; // Combined bold/italic
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;

    let lastIndex = 0;
    let match;

    const segments: { text: string, bold?: boolean, italics?: boolean }[] = [];
    let tempLastIndex = 0;

    // First pass for combined bold/italic
    while ((match = boldItalicRegex.exec(text)) !== null) {
      if (match.index > tempLastIndex) {
        segments.push({ text: text.substring(tempLastIndex, match.index) });
      }
      segments.push({ text: match[1], bold: true, italics: true });
      tempLastIndex = boldItalicRegex.lastIndex;
    }
    if (tempLastIndex < text.length) {
      segments.push({ text: text.substring(tempLastIndex) });
    }

    // Second pass for bold and italic on remaining segments
    const finalSegments: { text: string, bold?: boolean, italics?: boolean }[] = [];
    for (const segment of segments) {
      if (segment.bold && segment.italics) { // Already processed bold/italic
        finalSegments.push(segment);
        continue;
      }

      let innerTempLastIndex = 0;
      let innerMatch;
      const subSegments: { text: string, bold?: boolean, italics?: boolean }[] = [];

      // Process bold within current segment
      while ((innerMatch = boldRegex.exec(segment.text)) !== null) {
        if (innerMatch.index > innerTempLastIndex) {
          subSegments.push({ text: segment.text.substring(innerTempLastIndex, innerMatch.index) });
        }
        subSegments.push({ text: innerMatch[1], bold: true });
        innerTempLastIndex = boldRegex.lastIndex;
      }
      if (innerTempLastIndex < segment.text.length) {
        subSegments.push({ text: segment.text.substring(innerTempLastIndex) });
      }

      // Process italic on sub-segments that are not bold
      for (const subSegment of subSegments) {
        if (subSegment.bold) {
          finalSegments.push(subSegment);
          continue;
        }
        let superInnerTempLastIndex = 0;
        let superInnerMatch;
        while ((superInnerMatch = italicRegex.exec(subSegment.text)) !== null) {
          if (superInnerMatch.index > superInnerTempLastIndex) {
            finalSegments.push({ text: subSegment.text.substring(superInnerTempLastIndex, superInnerMatch.index) });
          }
          finalSegments.push({ text: superInnerMatch[1], italics: true });
          superInnerTempLastIndex = italicRegex.lastIndex;
        }
        if (superInnerTempLastIndex < subSegment.text.length) {
          finalSegments.push({ text: subSegment.text.substring(superInnerTempLastIndex) });
        }
      }
    }

    for (const segment of finalSegments) {
      children.push(new TextRun({
        text: segment.text,
        bold: segment.bold,
        italics: segment.italics,
        color: defaultTextColor,
      }));
    }
    return children;
  };


  const exportToDocx = async (study: GeneratedStudy) => {
    if (!study.content) return alert("Contenu vide !");

    const defaultTextColor = (settings.backgroundColor === '#f4f4f5' || settings.backgroundColor === '#fef3c7') ? '000000' : 'FFFFFF';
    const btnColor = (settings.customButtonHex || settings.buttonColor).replace('#', '');

    const docChildren = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: study.title, color: defaultTextColor, size: 48, bold: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [new TextRun({ text: `Date: ${study.date}`, color: defaultTextColor, size: 24, italics: true })]
      }),
    ];

    study.content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        docChildren.push(new Paragraph({ text: '', spacing: { after: 60 } })); // Add empty line for spacing
        return;
      }

      if (trimmed.startsWith('## Sources Brutes Trouvées :') || trimmed.startsWith('## Explication de l\'IA :') || trimmed.startsWith('## Liens des Sources :')) {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^##\s*/, ''), bold: true, color: btnColor, size: 36 })],
          spacing: { before: 360, after: 120 },
          heading: HeadingLevel.HEADING_2,
        }));
      } else if (trimmed.startsWith('# ')) {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: trimmed.replace(/^#\s*/, ''), bold: true, color: btnColor, size: 32 })],
          spacing: { before: 240, after: 120 },
          heading: HeadingLevel.HEADING_3,
        }));
      } else if (trimmed.match(/^(JOYAUX DE LA PAROLE DE DIEU|PERLES SPIRITUELLES|APPLIQUE-TOI AU MINISTÈRE|VIE CHRÉTIENNE|ÉTUDE BIBLIQUE DE L'ASSEMBLÉE|QUESTIONS DE RÉVISION|PORTE-EN-PORTE|NOUVELLE VISITE|COURS BIBLIQUE|SUJET|ENTRÉE EN MATIÈRE|MANIÈRE DE FAIRE|CONCLUSION|POINTS À DÉVELOPPER|POINTS PRINCIPAUX|QUESTION POUR REVENIR):/i)) {
        // Specific labels for different parts
        const labelMatch = trimmed.match(/^(JOYAUX DE LA PAROLE DE DIEU|PERLES SPIRITUELLES|APPLIQUE-TOI AU MINISTÈRE|VIE CHRÉTIENNE|ÉTUDE BIBLIQUE DE L'ASSEMBLÉE|QUESTIONS DE RÉVISION|PORTE-EN-PORTE|NOUVELLE VISITE|COURS BIBLIQUE|SUJET|ENTRÉE EN MATIÈRE|MANIÈRE DE FAIRE|CONCLUSION|POINTS À DÉVELOPPER|POINTS PRINCIPAUX|QUESTION POUR REVENIR):/i);
        if (labelMatch) {
          const label = labelMatch[0];
          const rest = trimmed.substring(label.length).trim();
          docChildren.push(new Paragraph({
            children: [
              new TextRun({ text: label, bold: true, color: btnColor, size: 24 }),
              ...formatTextRunForDocx(rest, defaultTextColor)
            ],
            spacing: { before: 180, after: 90 },
          }));
        }
      }
      else if (trimmed.startsWith('PARAGRAPHE')) {
        docChildren.push(new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, color: btnColor, size: 28 })],
          spacing: { before: 180, after: 90 },
        }));
      } else if (trimmed.startsWith('VERSET:')) {
        const [label, ...rest] = trimmed.split(':');
        docChildren.push(new Paragraph({
          children: [
            new TextRun({ text: `${label}: `, bold: true, color: btnColor }),
            ...formatTextRunForDocx(rest.join(':').trim(), defaultTextColor)
          ],
          border: { left: { color: btnColor, size: 24, style: 'single' } },
          indent: { left: 360 },
          spacing: { before: 120, after: 120 },
        }));
      } else {
        docChildren.push(new Paragraph({
          children: formatTextRunForDocx(trimmed, defaultTextColor),
          spacing: { after: 60 }
        }));
      }
    });

    const doc = new Document({ sections: [{ children: docChildren }] });
    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer]), `${study.title.replace(/[\s\W]+/g, '_')}.docx`);
  };

  const exportToPdf = (study: GeneratedStudy) => {
    if (!study.content) return alert("Contenu vide !");
    const doc = new jsPDF();
    const margin = 15;
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const defaultTextColor = (settings.backgroundColor === '#f4f4f5' || settings.backgroundColor === '#fef3c7') ? '#000000' : '#FFFFFF';
    const btnColor = settings.customButtonHex || settings.buttonColor || '#4a70b5';

    doc.setFont('helvetica');
    doc.setTextColor(defaultTextColor);

    // Title
    doc.setFontSize(24);
    doc.text(study.title, pageWidth / 2, y + 10, { align: 'center' });
    y += 20;

    // Date
    doc.setFontSize(12);
    doc.text(`Généré le ${study.date}`, pageWidth / 2, y + 5, { align: 'center' });
    y += 15;

    // Content
    doc.setFontSize(11);
    doc.setTextColor(defaultTextColor);

    const addTextWithLineBreaks = (text: string, x: number, yPos: number, maxWidth: number, lineHeight: number, options: any = {}) => {
      const textLines = doc.splitTextToSize(text, maxWidth);
      doc.text(textLines, x, yPos, options);
      return yPos + (textLines.length * lineHeight);
    };
    
    study.content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        y += 5; // Spacing for empty lines
        return;
      }

      // Check for page overflow
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
        doc.setTextColor(defaultTextColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
      }

      if (trimmed.startsWith('## Sources Brutes Trouvées :') || trimmed.startsWith('## Explication de l\'IA :') || trimmed.startsWith('## Liens des Sources :')) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(btnColor);
        y = addTextWithLineBreaks(trimmed.replace(/^##\s*/, ''), margin, y + 5, pageWidth - 2 * margin, 7);
        doc.setTextColor(defaultTextColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
      } else if (trimmed.startsWith('# ')) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(btnColor);
        y = addTextWithLineBreaks(trimmed.replace(/^#\s*/, ''), margin, y + 5, pageWidth - 2 * margin, 7);
        doc.setTextColor(defaultTextColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
      } else if (trimmed.match(/^(JOYAUX DE LA PAROLE DE DIEU|PERLES SPIRITUELLES|APPLIQUE-TOI AU MINISTÈRE|VIE CHRÉTIENNE|ÉTUDE BIBLIQUE DE L'ASSEMBLÉE|QUESTIONS DE RÉVISION|PORTE-EN-PORTE|NOUVELLE VISITE|COURS BIBLIQUE|SUJET|ENTRÉE EN MATIÈRE|MANIÈRE DE FAIRE|CONCLUSION|POINTS À DÉVELOPPER|POINTS PRINCIPAUX|QUESTION POUR REVENIR):/i)) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(btnColor);
        const [label, ...rest] = trimmed.split(':');
        let currentX = margin;
        y = addTextWithLineBreaks(`${label}: `, currentX, y, pageWidth - 2 * margin, 7, { align: 'left' });
        currentX += doc.getStringUnitWidth(`${label}: `) * doc.getFontSize() + 2; // Adjust x for remaining text
        doc.setTextColor(defaultTextColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        y = addTextWithLineBreaks(rest.join(':').trim(), currentX, y - (doc.splitTextToSize(`${label}: `, pageWidth - 2 * margin).length * 7), pageWidth - currentX - margin, 7, { align: 'left' });
        y += 5; // Extra spacing after a section header
      } else if (trimmed.startsWith('PARAGRAPHE')) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(btnColor);
        y = addTextWithLineBreaks(trimmed, margin, y + 5, pageWidth - 2 * margin, 7);
        doc.setTextColor(defaultTextColor);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
      } else if (trimmed.startsWith('VERSET:')) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'italic');
        y = addTextWithLineBreaks(trimmed, margin + 5, y + 3, pageWidth - 2 * margin - 10, 6);
        doc.setFont('helvetica', 'normal');
      } else if (trimmed.startsWith('- ')) { // List items
        y = addTextWithLineBreaks(trimmed, margin + 5, y + 3, pageWidth - 2 * margin - 10, 6);
      } else { // Normal text
        y = addTextWithLineBreaks(trimmed, margin, y + 3, pageWidth - 2 * margin, 6);
      }
    });

    doc.save(`${study.title.replace(/[\s\W]+/g, '_')}.pdf`);
  };

  const getPartLabel = (part: StudyPart | undefined) => {
    const options = [
      { value: 'joyaux_parole_dieu', label: 'Joyaux de la Parole de Dieu' },
      { value: 'perles_spirituelles', label: 'Perles Spirituelles' },
      { value: 'applique_ministere', label: 'Applique-toi au Ministère' },
      { value: 'vie_chretienne', label: 'Vie Chrétienne' },
      { value: 'etude_biblique_assemblee', label: 'Étude Biblique de l\'Assemblée' },
      { value: 'tout', label: 'Toutes les parties' },
    ];
    const option = options.find(opt => opt.value === part);
    return option ? option.label : 'Toutes les parties';
  };

  if (selectedStudy) {
    return (
      <div className={`animate-in fade-in duration-500 pb-24 ${readingMode ? 'fixed inset-0 z-[100] bg-[var(--bg-color)] overflow-y-auto p-6' : ''}`}>
        <div className="flex items-center justify-between mb-10 sticky top-0 py-4 z-20 bg-[var(--bg-color)]">
          <button onClick={() => setSelectedStudy(null)} className="flex items-center gap-2 opacity-50 hover:opacity-100 uppercase font-black text-xs">
            <ChevronLeft size={20} /> Fermer
          </button>
          <div className="flex gap-2">
            <button onClick={() => setReadingMode(!readingMode)} className="p-3 bg-white/5 rounded-xl border border-white/10">{readingMode ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}</button>
            <button onClick={() => exportToDocx(selectedStudy)} className="p-3 bg-white/5 rounded-xl border border-white/10"><FileSignature size={20}/></button>
            <button onClick={() => exportToPdf(selectedStudy)} className="p-3 bg-white/5 rounded-xl border border-white/10"><Download size={20}/></button>
            <button onClick={(e) => handleDelete(selectedStudy.id, e)} className="p-3 bg-white/5 rounded-xl border border-white/10 text-red-400"><Trash2 size={20}/></button>
          </div>
        </div>

        <article className="max-w-3xl mx-auto space-y-10">
          <header className="text-center space-y-4">
            <span className="px-4 py-1 bg-[var(--btn-color)]/20 text-[var(--btn-color)] rounded-full text-[10px] font-black uppercase tracking-widest">{selectedStudy.type}</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{selectedStudy.title}</h1>
            <p className="opacity-30 text-xs">{selectedStudy.date}</p>
          </header>
          <div className="prose prose-invert max-w-none font-serif text-lg leading-relaxed whitespace-pre-wrap opacity-80">
            {selectedStudy.content}
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
        <HistoryIcon className="text-[var(--btn-color)]" /> Historique Local
      </h2>
      {history.length === 0 ? (
        <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center opacity-20">
          <FileText size={64} className="mx-auto mb-4" />
          <p className="uppercase font-black tracking-widest">Aucune étude sauvegardée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map(study => (
            <div key={study.id} onClick={() => setSelectedStudy(study)} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:border-[var(--btn-color)] transition-all cursor-pointer group relative overflow-hidden">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">{study.type}</span>
              <h3 className="text-xl font-black mt-2 uppercase line-clamp-2 leading-tight">{study.title}</h3>
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] opacity-30">{study.date}</span>
                <ChevronRight size={16} className="text-[var(--btn-color)] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;