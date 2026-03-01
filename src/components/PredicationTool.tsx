import { useState } from 'react';
import { PredicationType } from '../types';
import { Home, MessageCircle, BookOpen, Globe } from 'lucide-react';

const PredicationTool = (_props: any) => {
  const [step, setStep] = useState(1);
  const [, setType] = useState<PredicationType | null>(null);
  const [input, setInput] = useState('');

  const types = [
    { id: 'porte_en_porte', label: 'Porte en porte', icon: <Home/> },
    { id: 'nouvelle_visite', label: 'Nouvelle Visite', icon: <MessageCircle/> },
    { id: 'cours_biblique', label: 'Cours Biblique', icon: <BookOpen/> },
    { id: 'temoignage_public', label: 'Public', icon: <Globe/> },
  ];

  if (step === 1) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map(t => (
          <button key={t.id} onClick={() => { setType(t.id as any); setStep(2); }} className="p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 text-left">
            <div className="text-[var(--btn-color)] mb-4">{t.icon}</div>
            <span className="font-black uppercase tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
        <h3 className="text-xl font-black uppercase mb-4">Analyse de la prédication</h3>
        <textarea 
          className="w-full bg-black/20 border border-white/10 rounded-2xl p-6 min-h-[200px] outline-none focus:border-[var(--btn-color)]"
          placeholder="Collez le lien jw.org ou décrivez le sujet..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="w-full py-6 mt-6 bg-[var(--btn-color)] text-[var(--btn-text)] rounded-2xl font-black uppercase tracking-widest">
          Générer la préparation
        </button>
      </div>
    </div>
  );
};

export default PredicationTool;
