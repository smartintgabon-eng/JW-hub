import React from 'react';
import { AppSettings } from '../types';
import { CheckCircle, Zap, Shield, Smartphone, Mic, Search } from 'lucide-react';

interface UpdatesProps {
  settings: AppSettings;
}

const Updates: React.FC<UpdatesProps> = () => {
  const updates = [
    {
      version: "2.1.0",
      date: "27 Février 2026",
      title: "Mise à jour Majeure : Discours & Stabilité",
      changes: [
        { icon: <Mic size={18} />, text: "Nouvel onglet 'Discours' avec 4 modes complets (Normal, Jeudi, Dimanche, Spécial)." },
        { icon: <Shield size={18} />, text: "Sécurisation totale des appels API (Correction 'Unexpected token <')." },
        { icon: <Zap size={18} />, text: "Passage au modèle Gemini 1.5 Flash pour une stabilité maximale." },
        { icon: <Search size={18} />, text: "Réparation du module de Recherche et du Manager de Préférences." },
        { icon: <Smartphone size={18} />, text: "Support PWA : Installation possible comme une application native." },
      ]
    },
    {
      version: "2.0.0",
      date: "26 Février 2026",
      title: "Refonte de l'interface",
      changes: [
        { icon: <CheckCircle size={18} />, text: "Nouvelle interface utilisateur moderne et fluide." },
        { icon: <CheckCircle size={18} />, text: "Système de thèmes personnalisables." },
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 p-4">
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
        <div className="p-2 bg-[var(--btn-color)]/20 rounded-xl">
          <Zap className="text-[var(--btn-color)]" size={32} />
        </div>
        Mises à jour
      </h2>

      <div className="space-y-8">
        {updates.map((update, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-wide">{update.title}</h3>
                <p className="opacity-60 font-mono text-sm mt-1">Version {update.version} • {update.date}</p>
              </div>
              <div className="px-4 py-2 bg-[var(--btn-color)]/10 border border-[var(--btn-color)]/30 rounded-full text-[var(--btn-color)] font-bold text-xs uppercase tracking-widest">
                {index === 0 ? "Dernière version" : "Archivé"}
              </div>
            </div>

            <div className="space-y-4">
              {update.changes.map((change, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-black/20 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                  <div className="mt-1 text-[var(--btn-color)] opacity-80">
                    {change.icon}
                  </div>
                  <p className="text-sm font-medium leading-relaxed opacity-90">
                    {change.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Updates;
