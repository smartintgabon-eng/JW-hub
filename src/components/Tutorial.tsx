import React from 'react';
import { BookOpen, Search, Mic, Home } from 'lucide-react';

const Tutorial: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-12 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-gray-900">Guide Expert</h2>
        <p className="text-gray-500 text-lg">Maîtrisez votre assistant spirituel en 2 minutes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TutorialCard 
          icon={<BookOpen size={24} />} 
          title="Cahier & Tour de Garde" 
          desc="Préparez vos réunions de semaine et d'étude de la Tour de Garde. Collez le lien jw.org ou le texte pour une analyse instantanée." 
        />
        <TutorialCard 
          icon={<Search size={24} />} 
          title="Recherches Avancées" 
          desc="Recherche hybride intelligente sur jw.org et WOL avec images et résumés. Posez n'importe quelle question biblique." 
        />
        <TutorialCard 
          icon={<Home size={24} />} 
          title="Prédication" 
          desc="Des préparations sur mesure pour le porte-à-porte, les nouvelles visites et les cours bibliques." 
        />
        <TutorialCard 
          icon={<Mic size={24} />} 
          title="Discours" 
          desc="Préparez vos discours avec 4 modes spécialisés (Normal, Jeudi, Dimanche, Spécial). Structure complète et références." 
        />
      </div>
    </div>
  );
};

const TutorialCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-[#4a6da7]/50 hover:shadow-md transition-all group">
    <div className="w-12 h-12 bg-[#4a6da7]/10 rounded-xl flex items-center justify-center mb-6 text-[#4a6da7] group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

export default Tutorial;
