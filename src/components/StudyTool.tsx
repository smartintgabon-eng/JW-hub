import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { AppSettings, GeneratedStudy, HistoryCategory, StudyPart, PredicationType } from '../types';
import { saveStudy, getHistoryByCategory, deleteStudy } from '../utils/storage.ts';
import { Search, Link as LinkIcon, Calendar, Trash2, Clock } from 'lucide-react';

interface StudyToolProps {
  category: HistoryCategory;
  title: string;
  icon: React.ReactNode;
  settings: AppSettings;
  setGlobalLoadingMessage: (msg: string | null) => void;
  placeholderLink?: string;
  placeholderTheme?: string;
  showParts?: boolean; // Pour Cahier Vie et Ministère
  showPredicationTypes?: boolean; // Pour Prédication
}

const StudyTool: React.FC<StudyToolProps> = ({ 
  category, 
  title, 
  icon, 
  settings, 
  setGlobalLoadingMessage,
  placeholderLink = "Collez le lien jw.org ici...",
  placeholderTheme = "Ou entrez un thème / date...",
  showParts = false,
  showPredicationTypes = false
}) => {
  const [mode, setMode] = useState<'link' | 'theme'>('link');
  const [input, setInput] = useState('');
  const [selectedPart, setSelectedPart] = useState<StudyPart>('tout');
  const [selectedPredType, setSelectedPredType] = useState<PredicationType>('porte_en_porte');
  const [history, setHistory] = useState<GeneratedStudy[]>([]);
  const [currentStudy, setCurrentStudy] = useState<GeneratedStudy | null>(null);

  useEffect(() => {
    loadHistory();
  }, [category]);

  const loadHistory = () => {
    setHistory(getHistoryByCategory(category));
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Supprimer cette étude ?')) {
      deleteStudy(id);
      loadHistory();
      if (currentStudy?.id === id) setCurrentStudy(null);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return alert('Veuillez entrer un lien ou un thème.');

    setGlobalLoadingMessage(`Analyse en cours pour ${title}...`);
    try {
      const prompt = `
        Analyse le contenu suivant pour la catégorie "${title}".
        Type d'entrée : ${mode === 'link' ? 'Lien direct jw.org' : 'Thème/Date'}.
        Contenu : ${input}.
        ${showParts ? `Partie spécifique demandée : ${selectedPart}.` : ''}
        ${showPredicationTypes ? `Type de prédication : ${selectedPredType}.` : ''}
        
        Instructions :
        - Si c'est un lien, analyse le contenu de la page (simulé ou via recherche).
        - Fournis une réponse structurée, claire et utile pour l'étude ou la réunion.
        - Cite les versets bibliques clés.
        - Sois encourageant et précis.
      `;

      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: category.toUpperCase(), // WATCHTOWER, MINISTRY, PREDICATION, RECHERCHES
          input: prompt,
          settings,
          mode, // 'link' ou 'theme' pour aider le backend
          rawInput: input // L'URL ou le texte brut
        }),
      });

      if (!response.ok) throw new Error('Erreur API');

      const data = await response.json();
      
      const newStudy: GeneratedStudy = {
        id: Date.now().toString(),
        type: category === 'recherches' ? 'RECHERCHES' : category === 'predication_porte_en_porte' ? 'PREDICATION' : 'WATCHTOWER', // Simplification
        category,
        title: mode === 'link' ? 'Étude via Lien' : input,
        date: new Date().toLocaleDateString(),
        content: data.text,
        timestamp: Date.now(),
        url: mode === 'link' ? input : undefined,
        part: showParts ? selectedPart : undefined,
        preachingType: showPredicationTypes ? selectedPredType : undefined
      };

      saveStudy(newStudy);
      loadHistory();
      setCurrentStudy(newStudy);
      setInput(''); // Reset input après succès

    } catch (e) {
      console.error(e);
      alert('Erreur lors de la génération. Vérifiez votre connexion.');
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-white">
          <div className="p-2 bg-[var(--btn-color)]/20 rounded-xl">
            {icon}
          </div>
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input & Options */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl">
            {/* Mode Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl mb-6">
              <button 
                onClick={() => setMode('link')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'link' ? 'bg-[var(--btn-color)] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
              >
                <LinkIcon size={16} className="inline mr-2" /> Lien
              </button>
              <button 
                onClick={() => setMode('theme')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'theme' ? 'bg-[var(--btn-color)] text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
              >
                <Calendar size={16} className="inline mr-2" /> Thème
              </button>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'link' ? placeholderLink : placeholderTheme}
                className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:border-blue-600 outline-none min-h-[120px] resize-none transition-colors"
              />
            </div>

            {/* Specific Options */}
            {showParts && (
              <div className="mb-6 space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Partie à étudier</label>
                <select 
                  value={selectedPart} 
                  onChange={(e) => setSelectedPart(e.target.value as StudyPart)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-blue-600 transition-colors"
                >
                  <option value="tout">Toute la réunion</option>
                  <option value="joyaux_parole_dieu">Joyaux de la Parole de Dieu</option>
                  <option value="perles_spirituelles">Perles Spirituelles</option>
                  <option value="applique_ministere">Applique-toi au ministère</option>
                  <option value="vie_chretienne">Vie Chrétienne</option>
                  <option value="etude_biblique_assemblee">Étude Biblique de l'Assemblée</option>
                </select>
              </div>
            )}

            {showPredicationTypes && (
              <div className="mb-6 space-y-2">
                <label className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Type de prédication</label>
                <select 
                  value={selectedPredType} 
                  onChange={(e) => setSelectedPredType(e.target.value as PredicationType)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-blue-600 transition-colors"
                >
                  <option value="porte_en_porte">Porte en porte</option>
                  <option value="nouvelle_visite">Nouvelle Visite</option>
                  <option value="cours_biblique">Cours Biblique</option>
                </select>
              </div>
            )}

            <button 
              onClick={handleGenerate}
              className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Search size={20} /> Analyser
            </button>
          </div>

          {/* History List (Mobile/Desktop Sidebar) */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 shadow-xl max-h-[400px] overflow-y-auto">
            <h3 className="text-xs font-black uppercase text-zinc-500 mb-4 flex items-center gap-2 tracking-wider">
              <Clock size={14} /> Historique récent
            </h3>
            {history.length === 0 ? (
              <p className="text-zinc-600 text-sm text-center py-4">Aucune étude récente.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setCurrentStudy(item)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${currentStudy?.id === item.id ? 'bg-blue-600/10 border-blue-600/50' : 'bg-black/40 border-zinc-800 hover:bg-zinc-800'}`}
                  >
                    <div className="pr-8">
                      <p className={`font-bold text-sm truncate ${currentStudy?.id === item.id ? 'text-blue-400' : 'text-zinc-300 group-hover:text-white'}`}>{item.title}</p>
                      <p className="text-xs text-zinc-600 mt-1">{item.date}</p>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(item.id, e)}
                      className="absolute right-2 top-2 p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Content Display */}
        <div className="lg:col-span-2">
          {currentStudy ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 shadow-2xl min-h-[600px] animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-zinc-800">
                <div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{currentStudy.title}</h3>
                  <p className="text-sm text-zinc-500 flex items-center gap-2 font-medium">
                    <Calendar size={14} /> {currentStudy.date}
                    {currentStudy.url && (
                      Array.isArray(currentStudy.url) ? (
                        currentStudy.url.map((u, i) => (
                          <a key={i} href={u} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline ml-2 flex items-center gap-1"><LinkIcon size={12} /> Source {i + 1}</a>
                        ))
                      ) : (
                        <a href={currentStudy.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 hover:underline ml-2 flex items-center gap-1"><LinkIcon size={12} /> Source</a>
                      )
                    )}
                  </p>
                </div>
                {/* Indicateur IA */}
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Gemini Pro</span>
                </div>
              </div>
              
              <div className="markdown-body prose prose-invert max-w-none prose-headings:uppercase prose-headings:tracking-tight prose-headings:font-black prose-p:text-zinc-300 prose-strong:text-white">
                <Markdown>{currentStudy.content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-8 shadow-xl min-h-[400px] flex flex-col items-center justify-center text-center opacity-50 border-dashed">
              <div className="w-24 h-24 bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-zinc-600">
                {icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-zinc-400 uppercase tracking-widest">Prêt à étudier ?</h3>
              <p className="max-w-md text-zinc-600">Sélectionnez une étude dans l'historique ou lancez une nouvelle analyse.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyTool;
