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
  onGenerationComplete: () => void;
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
  showPredicationTypes = false,
  onGenerationComplete
}) => {
  const [mode, setMode] = useState<'link' | 'theme'>('link');
  const [input, setInput] = useState('');
  const [selectedPart, setSelectedPart] = useState<StudyPart>('tout');
  const [selectedPredType, setSelectedPredType] = useState<PredicationType>('porte_en_porte');

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
      setInput(''); // Reset input après succès
      onGenerationComplete();

    } catch (e) {
      console.error(e);
      alert('Erreur lors de la génération. Vérifiez votre connexion.');
    } finally {
      setGlobalLoadingMessage(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-2xl text-white shadow-lg" style={{ backgroundColor: settings.btnColor }}>
          {icon}
        </div>
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">
          {title}
        </h2>
      </div>

      <div className="bg-[#111] border border-white/10 rounded-[2rem] p-6 md:p-8 shadow-xl">
        {/* Mode Switcher */}
        <div className="flex gap-2 mb-6">
          <button 
            onClick={() => setMode('link')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === 'link' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Lien jw.org
          </button>
          <button 
            onClick={() => setMode('theme')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${mode === 'theme' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Saisie Manuelle
          </button>
        </div>

        {/* Input Field */}
        <div className="mb-6">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'link' ? placeholderLink : placeholderTheme}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-white/30 outline-none min-h-[120px] resize-none transition-all"
          />
        </div>

        {/* Specific Options */}
        {showParts && (
          <div className="mb-6 space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Partie à étudier</label>
            <select 
              value={selectedPart} 
              onChange={(e) => setSelectedPart(e.target.value as StudyPart)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-white/30 transition-all"
            >
              <option value="tout" className="bg-[#111]">Toute la réunion</option>
              <option value="joyaux_parole_dieu" className="bg-[#111]">Joyaux de la Parole de Dieu</option>
              <option value="perles_spirituelles" className="bg-[#111]">Perles Spirituelles</option>
              <option value="applique_ministere" className="bg-[#111]">Applique-toi au ministère</option>
              <option value="vie_chretienne" className="bg-[#111]">Vie Chrétienne</option>
              <option value="etude_biblique_assemblee" className="bg-[#111]">Étude Biblique de l'Assemblée</option>
            </select>
          </div>
        )}

        {showPredicationTypes && (
          <div className="mb-6 space-y-2">
            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Type de prédication</label>
            <select 
              value={selectedPredType} 
              onChange={(e) => setSelectedPredType(e.target.value as PredicationType)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-white/30 transition-all"
            >
              <option value="porte_en_porte" className="bg-[#111]">Porte en porte</option>
              <option value="nouvelle_visite" className="bg-[#111]">Nouvelle Visite</option>
              <option value="cours_biblique" className="bg-[#111]">Cours Biblique</option>
            </select>
          </div>
        )}

        <button 
          onClick={handleGenerate}
          style={{ backgroundColor: settings.btnColor }}
          className="w-full py-4 text-white font-black uppercase tracking-widest rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Search size={20} /> Confirmer l'article
        </button>
      </div>
    </div>
  );
};

export default StudyTool;
