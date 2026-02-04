
import React, { useState } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, Lightbulb, Link as LinkIcon, Search, Save } from 'lucide-react';

const Tutorial: React.FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue sur JW Study Pro",
      content: "Cette application vous aide à préparer vos réunions en générant des réponses structurées, des commentaires profonds et des applications pratiques basés sur la Traduction du Monde Nouveau.",
      icon: <HelpCircle className="text-blue-500" size={48} />
    },
    {
      title: "Comment obtenir les liens ?",
      content: "Allez sur JW.org, trouvez l'article d'étude de la Tour de Garde ou du Cahier Vie et Ministère. Copiez le lien de la page (URL) pour le coller dans l'espace prévu dans l'application.",
      icon: <LinkIcon className="text-indigo-500" size={48} />
    },
    {
      title: "Recherche par semaine",
      content: "Si vous n'avez pas le lien, vous pouvez simplement taper la date ou le thème, par exemple : 'Semaine du 15 mai' ou 'Article sur la patience'. L'IA cherchera pour vous.",
      icon: <Search className="text-green-500" size={48} />
    },
    {
      title: "Personnalisation & Historique",
      content: "Chaque réponse générée est stockée dans votre 'Historique' (mémoire cache locale). Vous pouvez changer la couleur de fond dans les 'Paramètres' pour un confort visuel optimal.",
      icon: <Save className="text-amber-500" size={48} />
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-in fade-in zoom-in duration-500">
      <div className="p-8 bg-zinc-900 border border-zinc-800 rounded-[3rem] shadow-2xl relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 p-6 bg-zinc-950 border border-zinc-800 rounded-3xl shadow-xl">
          {currentStep.icon}
        </div>
        <div className="pt-10 space-y-6">
          <h2 className="text-3xl font-black text-white">{currentStep.title}</h2>
          <p className="text-zinc-400 text-lg leading-relaxed">{currentStep.content}</p>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <button 
          disabled={step === 0}
          onClick={() => setStep(s => s - 1)}
          className={`p-4 rounded-full transition-all ${step === 0 ? 'text-zinc-700' : 'bg-zinc-800 text-white hover:bg-zinc-700 active:scale-90'}`}
        >
          <ChevronLeft size={28} />
        </button>

        <div className="flex space-x-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-blue-500' : 'w-2 bg-zinc-800'}`} />
          ))}
        </div>

        <button 
          disabled={step === steps.length - 1}
          onClick={() => setStep(s => s + 1)}
          className={`p-4 rounded-full transition-all ${step === steps.length - 1 ? 'text-zinc-700' : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-90 shadow-lg shadow-blue-600/30'}`}
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="flex items-center space-x-2 text-zinc-500 text-sm italic">
        <Lightbulb size={16} className="text-amber-500" />
        <span>Astuce : Installez l'application via Chrome pour l'utiliser hors ligne.</span>
      </div>
    </div>
  );
};

export default Tutorial;