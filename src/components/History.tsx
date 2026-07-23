import React, { useState, useEffect } from 'react';
import { 
  History as HistoryIcon, Trash2, ChevronLeft, ChevronRight, FileText, Minimize2, Maximize2, FileSignature, Download
} from 'lucide-react';
import { GeneratedStudy, AppSettings } from '../types.ts'; 
import { deleteFromHistory } from '../utils/storage.ts'; 
import saveAs from 'file-saver'; 
import { Document, Paragraph, TextRun, Packer, AlignmentType, HeadingLevel } from 'docx'; 
import jsPDF from 'jspdf';
import { getContrastTextColor } from '../utils/colorUtils.ts';
import html2pdf from 'html2pdf.js';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  history: GeneratedStudy[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedStudy[]>>;
  settings: AppSettings;
}

const getLocalizedText = (settings: AppSettings, key: string) => {
  const texts: { [key: string]: { [lang: string]: string } } = {
    'close': { 'fr': 'Fermer', 'en': 'Close', 'es': 'Cerrar' },
    'deleteStudyConfirm': { 'fr': 'Voulez-vous supprimer cette étude ?', 'en': 'Do you want to delete this study?', 'es': '¿Desea eliminar este estudio?' },
    'emptyContent': { 'fr': 'Contenu vide !', 'en': 'Empty content!', 'es': '¡Contenido vacío!' },
    'historyTitle': { 'fr': 'Historique Local', 'en': 'Local History', 'es': 'Historial Local' },
    'noStudySaved': { 'fr': 'Aucune étude sauvegardée', 'en': 'No study saved', 'es': 'Ningún estudio guardado' },
    'partLabelJoyaux': { 'fr': 'Joyaux de la Parole de Dieu', 'en': 'Treasures from God\'s Word', 'es': 'Joyas de la Palabra de Dios' },
    'partLabelPerles': { 'fr': 'Perles Spirituelles', 'en': 'Spiritual Gems', 'es': 'Perlas Espirituales' },
    'partLabelAppliqueToi': { 'fr': 'Applique-toi au Ministère', 'en': 'Apply Yourself to the Ministry', 'es': 'Aplicarse al Ministerio' },
    'partLabelVieChretienne': { 'fr': 'Vie Chrétienne', 'en': 'Christian Life', 'es': 'Vida Cristiana' },
    'partLabelEtudeBiblique': { 'fr': 'Étude Biblique de l\'Assemblée', 'en': 'Congregation Bible Study', 'es': 'Estudio Bíblico de la Congregación' },
    'partLabelTout': { 'fr': 'Toutes les parties', 'en': 'All Parts', 'es': 'Todas las partes' },
    'articleTypeWatchtower': { 'fr': 'Tour de Garde', 'en': 'Watchtower', 'es': 'La Atalaya' },
    'articleTypeMinistry': { 'fr': 'Cahier de Réunion', 'en': 'Meeting Workbook', 'es': 'Cuaderno de Reuniones' },
    'articleTypePredication': { 'fr': 'Prédication', 'en': 'Preaching', 'es': 'Predicación' },
    'articleTypeRecherches': { 'fr': 'Recherches', 'en': 'Research', 'es': 'Búsquedas' },
    'generatedOn': { 'fr': 'Généré le', 'en': 'Generated on', 'es': 'Generado el' }, // New key for generated date
  };
  return texts[key]?.[settings.language] || texts[key]?.['fr'];
};

const History: React.FC<Props> = ({ history, setHistory, settings }) => {
  const [selectedStudy, setSelectedStudy] = useState<GeneratedStudy | null>(null);
  const [readingMode, setReadingMode] = useState(false);

  useEffect(() => {
    if (readingMode) document.body.classList.add('reading-mode-active');
    else document.body.classList.remove('reading-mode-active');
  }, [readingMode]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(getLocalizedText(settings, 'deleteStudyConfirm'))) {
      deleteFromHistory(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (selectedStudy?.id === id) setSelectedStudy(null);
    }
  };

  const getStudyDate = (study: GeneratedStudy) => {
    if (study.timestamp) {
      return new Date(study.timestamp).toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : settings.language === 'es' ? 'es-ES' : 'en-US');
    }
    if (study.date) {
      const d = new Date(study.date);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : settings.language === 'es' ? 'es-ES' : 'en-US');
      }
    }
    return new Date().toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : settings.language === 'es' ? 'es-ES' : 'en-US');
  };

  const getStudyTitle = (study: GeneratedStudy) => {
    if (study.title && study.title !== "Generated Content" && study.title !== "Nouvelle Étude") {
      return study.title;
    }
    const titleMatch = study.content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    const lines = study.content.split('\n').filter(l => l.trim().length > 0);
    if (lines.length > 0) {
      return lines[0].replace(/^#+\s*/, '').trim();
    }
    return "Nouvelle Étude";
  };

  // Helper for DOCX to format text with Markdown-like bold/italic
  const formatTextRunForDocx = (text: string, defaultTextColor: string) => {
    const children: TextRun[] = [];
    const boldItalicRegex = /\*\*\*(.*?)\*\*\*/g; // Combined bold/italic
    const boldRegex = /\*\*(.*?)\*\*/g;
    const italicRegex = /\*(.*?)\*/g;


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
    if (!study.content) return alert(getLocalizedText(settings, 'emptyContent'));

    // Always use black text for DOCX as background is white by default
    const defaultTextColor = '000000';
    const btnColor = (settings.btnColor).replace('#', '');

    const docChildren = [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [new TextRun({ text: getStudyTitle(study), color: defaultTextColor, size: 48, bold: true })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [new TextRun({ text: `${getLocalizedText(settings, 'generatedOn')}: ${getStudyDate(study)}`, color: defaultTextColor, size: 24, italics: true })]
      }),
    ];

    if (study.type === 'RECHERCHES') {
      // Parse and format for RECHERCHES type
      study.content.split('NOM :').forEach((block, i) => {
        if (!block.trim() && i === 0) return; // Skip initial empty block if it exists
        if (!block.trim()) return;

        const lines = block.split('\n');
        const name = lines[0].trim();
        const linkLine = lines.find(l => l.includes('LIEN :')) || '';
        const link = linkLine.replace('LIEN :', '').trim();
        const explanationLines = lines.filter(l => l.includes('EXPLICATION :'));
        const explanation = explanationLines.map(l => l.replace('EXPLICATION :', '').trim()).join('\n');

        if (name) {
          docChildren.push(new Paragraph({
            children: [new TextRun({ text: `NOM : ${name}`, bold: true, color: btnColor, size: 32 })],
            spacing: { before: 360, after: 120 },
            heading: HeadingLevel.HEADING_3,
          }));
        }
        if (link) {
          docChildren.push(new Paragraph({
            children: [
              new TextRun({ text: 'LIEN : ', bold: true, color: defaultTextColor }),
              new TextRun({ text: link, italics: true, color: defaultTextColor, hyperlink: { link: link } })
            ],
            spacing: { after: 60 },
          }));
        }
        if (explanation) {
          docChildren.push(new Paragraph({
            children: [new TextRun({ text: 'EXPLICATION : ', bold: true, color: defaultTextColor })],
            spacing: { after: 60 },
          }));
          explanation.split('\n').forEach(expLine => {
            docChildren.push(new Paragraph({
              children: formatTextRunForDocx(expLine, defaultTextColor),
              spacing: { after: 60 }
            }));
          });
        }
      });
    } else {
      // Existing formatting for other study types
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
    }

    const doc = new Document({ sections: [{ children: docChildren }] });
    const buffer = await Packer.toBuffer(doc);
    saveAs(new Blob([buffer]), `${getStudyTitle(study).replace(/[\s\W]+/g, '_')}.docx`);
  };

  const exportToPdf = async (study: GeneratedStudy) => {
    if (!study.content) return alert(getLocalizedText(settings, 'emptyContent'));
    
    const element = document.getElementById('study-content-to-print');
    if (!element) return;
    
    // We create an isolated iframe to prevent html2canvas from parsing Tailwind v4 oklab colors in the main document stylesheets
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      return;
    }
    
    const btnColor = settings.btnColor || '#3b82f6';
    
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { 
              font-family: 'Inter', Helvetica, Arial, sans-serif; 
              color: #000000; 
              padding: 20px 40px; 
              line-height: 1.6;
              background: #ffffff;
            }
            /* Header styles */
            header { text-align: center; margin-bottom: 30px; }
            header span { font-size: 10px; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; color: ${btnColor}; opacity: 0.8; }
            header h1 { font-size: 32px; font-weight: 900; margin: 10px 0; color: #000; letter-spacing: -0.02em; }
            header p { font-size: 12px; opacity: 0.5; }
            
            /* Markdown styles */
            h1 { font-size: 26px; font-weight: 900; margin-top: 30px; margin-bottom: 15px; color: ${btnColor}; }
            h2 { font-size: 22px; font-weight: bold; margin-top: 25px; margin-bottom: 12px; color: ${btnColor}; }
            h3 { font-size: 18px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; color: ${btnColor}; }
            p { margin-bottom: 15px; font-size: 15px; }
            strong { font-weight: 900; color: ${btnColor}; }
            em { font-style: italic; color: #333; }
            ul { margin-left: 25px; margin-bottom: 15px; list-style-type: disc; }
            ol { margin-left: 25px; margin-bottom: 15px; list-style-type: decimal; font-weight: bold; color: ${btnColor}; }
            li { margin-bottom: 6px; font-weight: normal; color: #000; font-size: 15px; }
            li p { margin-bottom: 4px; }
            img { max-width: 100%; border-radius: 12px; margin: 25px auto; display: block; max-height: 400px; object-fit: contain; }
          </style>
        </head>
        <body>
          <div id="pdf-content">
            ${element.innerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    try {
      const opt = {
        margin:       15,
        filename:     `${getStudyTitle(study).replace(/[\s\W]+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      const targetElement = iframeDoc.getElementById('pdf-content');
      await html2pdf().set(opt).from(targetElement).save();
    } catch (e) {
      console.error('Error generating PDF:', e);
      alert('Une erreur est survenue lors de la création du PDF.');
    } finally {
      document.body.removeChild(iframe);
    }
  };



  const getStudyTypeLabel = (type: GeneratedStudy['type']) => {
    switch (type) {
      case 'WATCHTOWER': return getLocalizedText(settings, 'articleTypeWatchtower');
      case 'MINISTRY': return getLocalizedText(settings, 'articleTypeMinistry');
      case 'PREDICATION': return getLocalizedText(settings, 'articleTypePredication');
      case 'RECHERCHES': return getLocalizedText(settings, 'articleTypeRecherches');
      default: return type;
    }
  }

  const textColor = getContrastTextColor(settings.bgColor || '#f5f5f0');
  const proseClass = textColor === 'white' ? 'prose-invert' : '';

  if (selectedStudy) {
    return (
      <div className={`animate-in fade-in duration-500 pb-24 ${readingMode ? 'fixed inset-0 z-[100] bg-[var(--bg-color)] overflow-y-auto p-6' : ''}`}>
        <div className="flex items-center justify-between mb-10 sticky top-0 py-4 z-20 bg-[var(--bg-color)]/95 backdrop-blur-sm transition-all">
          <button onClick={() => setSelectedStudy(null)} className="flex items-center gap-2 opacity-50 hover:opacity-100 uppercase font-black text-xs">
            <ChevronLeft size={20} /> {getLocalizedText(settings, 'close')}
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setReadingMode(!readingMode)} 
              className={`p-3 rounded-xl border border-white/10 transition-all ${readingMode ? 'bg-[var(--btn-color)] text-[var(--btn-text)] shadow-lg' : 'bg-white/5 hover:bg-white/10'}`}
              title={readingMode ? "Quitter le mode lecture" : "Mode lecture"}
            >
              {readingMode ? <Minimize2 size={20}/> : <Maximize2 size={20}/>}
            </button>
            <button onClick={() => exportToDocx(selectedStudy)} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"><FileSignature size={20}/></button>
            <button onClick={() => exportToPdf(selectedStudy)} className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"><Download size={20}/></button>
            <button onClick={(e) => handleDelete(selectedStudy.id, e)} className="p-3 bg-white/5 rounded-xl border border-white/10 text-red-400 hover:bg-red-400/10 transition-all"><Trash2 size={20}/></button>
          </div>
        </div>

        <article id="study-content-to-print" className="max-w-3xl mx-auto space-y-10">
          <header className="text-center space-y-4">
            <span className="px-4 py-1 bg-[var(--btn-color)]/20 text-[var(--btn-color)] rounded-full text-[10px] font-black uppercase tracking-widest">{getStudyTypeLabel(selectedStudy.type)}</span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{selectedStudy.title}</h1>
            <p className="opacity-30 text-xs">{new Date(selectedStudy.timestamp).toLocaleDateString(settings.language === 'fr' ? 'fr-FR' : settings.language === 'es' ? 'es-ES' : 'en-US')}</p>
          </header>
          {selectedStudy.type === 'RECHERCHES' ? (
            <div className="space-y-8">
              {selectedStudy.content.split('NOM :').map((block, i) => {
                if (!block.trim() && i === 0) return null; // Skip initial empty block if it exists
                if (!block.trim()) return null;

                const lines = block.split('\n');
                const name = lines[0].trim();
                const linkLine = lines.find(l => l.includes('LIEN :')) || '';
                const link = linkLine.replace('LIEN :', '').trim();
                const explanationLines = lines.filter(l => l.includes('EXPLICATION :'));
                const explanation = explanationLines.map(l => l.replace('EXPLICATION :', '').trim()).join('\n');

                return (
                  <div key={i} className="border-l-2 border-[var(--btn-color)] pl-4 py-2">
                    <h4 className="font-black text-xl text-[var(--btn-color)] uppercase">{name}</h4>
                    {link && (
                      <p className="text-xs opacity-50 font-mono my-2 break-all">
                        <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          {link}
                        </a>
                      </p>
                    )}
                    {explanation && <p className="text-sm leading-relaxed">{explanation}</p>}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`prose ${proseClass} max-w-none font-sans text-lg leading-relaxed opacity-90`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-[var(--btn-color)]" {...props} />,
                  h2: ({node, ...props}) => <h2 className="text-2xl font-bold mt-6 mb-3 text-[var(--btn-color)]" {...props} />,
                  h3: ({node, ...props}) => <h3 className="text-xl font-bold mt-5 mb-2 text-[var(--btn-color)]" {...props} />,
                  strong: ({node, ...props}) => <strong className="font-black text-[var(--btn-color)]" {...props} />,
                  em: ({node, ...props}) => <em className="italic text-[var(--text-color)]/90" {...props} />,
                  ul: ({node, ...props}) => <ul className="list-disc pl-6 space-y-2 mb-4 marker:text-[var(--btn-color)]" {...props} />,
                  ol: ({node, ...props}) => <ol className="list-decimal pl-6 space-y-2 mb-4 text-[var(--btn-color)] font-bold" {...props} />,
                  li: ({node, ...props}) => <li className="mb-1 text-[var(--text-color)] font-normal" {...props} />,
                  p: ({node, ...props}) => <p className="mb-4 text-[var(--text-color)]" {...props} />,
                  img: ({node, ...props}) => <img className="rounded-2xl shadow-lg my-6 max-h-[60vh] object-contain mx-auto" {...props} />
                }}
              >
                {selectedStudy.content}
              </ReactMarkdown>
            </div>
          )}
        </article>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      <h2 className="text-3xl font-black uppercase mb-6 flex items-center gap-3">
        <HistoryIcon className="text-[var(--btn-color)]" /> {getLocalizedText(settings, 'historyTitle')}
      </h2>
      {history.length === 0 ? (
        <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center opacity-20">
          <FileText size={64} className="mx-auto mb-4" />
          <p className="uppercase font-black tracking-widest">{getLocalizedText(settings, 'noStudySaved')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {history.map(study => (
            <div key={study.id} onClick={() => setSelectedStudy(study)} className="bg-white/5 p-8 rounded-[2rem] border border-white/10 hover:border-[var(--btn-color)] transition-all cursor-pointer group relative overflow-hidden">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-widest">{getStudyTypeLabel(study.type)}</span>
              <h3 className="text-xl font-black mt-2 uppercase line-clamp-2 leading-tight">{getStudyTitle(study)}</h3>
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] opacity-30">{getStudyDate(study)}</span>
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
