import React from 'react';
import { Lightbulb, Link as LinkIcon, Search, Smartphone, Type, LayoutGrid, ChevronRight } from 'lucide-react';

interface Props {
  navigateTo: (v: any) => void;
  deferredPrompt: any;
  handleInstallClick: () => void;
}

const Tutorial: React.FC<Props> = ({ navigateTo, handleInstallClick }) => {
  const steps = [
    {
      title: "Choisir votre étude",
      desc: "Sélectionnez 'Cahier' pour les réunions de semaine ou 'Tour de Garde' pour le week-end.",
      icon: <LayoutGrid className="text-blue-400" size={32} />
    },
    {
      title: "Saisie Intelligente",
      desc: "Copiez le lien jw.org de l'article. Pour le Cahier, utilisez le '+' pour ajouter les articles de l'étude de livre.",
      icon: <LinkIcon className="text-indigo-400" size={32} />
    },
    {
      title: "Mode Manuel",
      desc: "Si un lien est bloqué, utilisez 'Saisie Manuelle' pour coller directement le texte de l'article.",
      icon: <Type className="text-violet-400" size={32} />
    },
    {
      title: "Options Expert",
      desc: "Générez uniquement ce dont vous avez besoin (Joyaux, Perles, Exposés) ou l'article complet.",
      icon: <Search className="text-emerald-400" size={32} />
    },
    {
      title: "Installation PWA",
      desc: "Installez l'app pour l'utiliser sans internet. Retrouvez vos études dans l'Historique.",
      icon: <Smartphone className="text-amber-400" size={32} />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-24">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Lightbulb size={40} />
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Guide Expert</h2>
        <p className="opacity-40 italic">Maîtrisez votre assistant spirituel en 2 minutes.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((s, i) => (
          <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex gap-6 items-start hover:bg-white/10 transition-all">
            <div className="p-4 bg-white/5 rounded-2xl">{s.icon}</div>
            <div className="space-y-2">
              <h3 className="font-black uppercase text-sm tracking-widest">{s.title}</h3>
              <p className="text-sm opacity-50 leading-relaxed">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <h3 className="text-2xl font-black uppercase mb-4">Prêt à commencer ?</h3>
        <p className="opacity-80 mb-8 max-w-lg mx-auto">Toutes vos préférences et votre historique sont sauvegardés automatiquement dans le cache de votre appareil.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigateTo('HOME' as any)} className="px-8 py-4 bg-white text-indigo-700 font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all">Retour Accueil</button>
          <button onClick={handleInstallClick} className="px-8 py-4 bg-black/20 text-white border border-white/20 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-black/30 transition-all">Installer l'App</button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;