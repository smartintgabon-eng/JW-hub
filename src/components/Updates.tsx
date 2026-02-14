import React from 'react';
import { BellRing, CheckCircle, Bug, Rocket, Megaphone } from 'lucide-react'; // Added Megaphone for new feature

interface UpdateItem {
  version: string;
  date: string;
  features: string[];
  fixes: string[];
}

const updates: UpdateItem[] = [
  {
    version: "1.0.0",
    date: "12 Octobre 2024",
    features: [
      "Lancement initial de JW Study Pro.",
      "Génération des réponses pour la Tour de Garde (lien direct ou recherche par date/thème).",
      "Génération des réponses pour le Cahier Vie et Ministère (lien direct ou recherche par date/thème).",
      "Sélection des parties d'étude pour le Cahier Vie et Ministère.",
      "Historique des études générées (stockage local hors ligne).",
      "Mode lecture immersif pour les études.",
      "Personnalisation de l'apparence (couleurs de fond et des boutons).",
      "Installation PWA (Progressive Web App) pour une utilisation hors ligne.",
      "Export des études au format DOCX et PDF."
    ],
    fixes: [
      "Correction des problèmes de compatibilité PWA pour une installation fluide."
    ]
  },
  {
    version: "1.1.0",
    date: "19 Octobre 2024",
    features: [
      "Amélioration majeure du 'grounding' de l'IA pour des réponses plus précises et fidèles aux publications jw.org.",
      "Prise en compte des références bibliques complètes dans les réponses.",
      "Nouvelle structure détaillée pour chaque partie du Cahier Vie et Ministère, basée sur le programme réel : Joyaux, Perles, Applique-toi (tous les exposés), Vie Chrétienne, Étude Biblique de l'Assemblée.",
      "Les questions d'application (pour nous, prédication, famille, etc.) sont désormais uniquement posées pour l'Étude Biblique de l'Assemblée."
    ],
    fixes: [
      "Correction de l'export DOCX/PDF : les réponses sont désormais entièrement visibles et le formatage (gras, italique) est correctement appliqué.",
      "Amélioration des messages de chargement : Un message global indique l'état de la génération et une redirection automatique vers l'historique est effectuée à la fin.",
      "Ajout du bouton 'Recommencer la recherche' après l'aperçu de l'article."
    ]
  },
  {
    version: "1.2.0",
    date: "26 Octobre 2024",
    features: [
      "**Nouveau : Onglet 'Prédication'** pour préparer différents types de présentations :",
      "- **Porte-en-porte :** Génération de sujet, entrée en matière, versets et question pour revenir, avec option d'offrir un cours biblique.",
      "- **Nouvelle Visite :** Préparation pour enchaîner un cours biblique ou répondre à une question en suspens, avec proposition systématique d'étude si pertinente.",
      "- **Cours Biblique :** Aide à la préparation de nouveaux chapitres ou à la poursuite d'études en cours.",
      "Amélioration significative du 'grounding' de l'IA : instruction plus stricte pour analyser les liens directs ou les résultats de recherche sans invention.",
      "Catégorisation des études dans l'historique pour une meilleure organisation (Cahier, Tour de Garde, Prédication : Porte-en-porte, Nouvelle Visite, Cours Biblique).",
      "Application des préférences de réponses (définies dans les paramètres) à toutes les sections de l'application, y compris la prédication.",
    ],
    fixes: [
      "Correction majeure des exports DOCX et PDF : le contenu est désormais complet, lisible, bien formaté et respecte les couleurs définies dans les paramètres.",
      "Correction du mode lecture : le contenu est visible et le bouton 'Fermer' (ou 'Quitter le mode lecture') est toujours accessible pour sortir du mode immersif.",
      "Unification du style de l'application en mode PWA hors ligne, garantissant une expérience visuelle cohérente avec la version en ligne.",
      "Meilleure gestion des erreurs et des quotas API avec des messages plus clairs et des délais de récupération adaptés."
    ]
  }
];

const Updates: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-6">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="p-4 rounded-2xl shadow-xl">
          <BellRing size={28} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Mises à jour</h2>
          <p className="opacity-40 text-sm font-bold tracking-wide">Découvrez les nouveautés et améliorations.</p>
        </div>
      </div>

      <div className="space-y-12">
        {updates.map((update, index) => (
          <div key={index} className="bg-white/5 border border-white/10 rounded-[2rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-white/10 rotate-12">
                <Rocket size={48} />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase opacity-40 tracking-widest block mb-1">Version</span>
                <h3 className="text-3xl font-black uppercase tracking-tight" style={{ color: 'var(--btn-color)' }}>{update.version}</h3>
              </div>
              <span className="text-sm opacity-50 font-bold">{update.date}</span>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="flex items-center space-x-2 text-white/70 font-bold text-lg uppercase tracking-wider"><CheckCircle size={20} className="text-emerald-500" /> Nouvelles Fonctionnalités</p>
              <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 font-medium leading-relaxed">
                {update.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>

            {update.fixes.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <p className="flex items-center space-x-2 text-white/70 font-bold text-lg uppercase tracking-wider"><Bug size={20} className="text-amber-500" /> Corrections et Optimisations</p>
                <ul className="list-disc list-inside space-y-2 pl-4 text-white/60 font-medium leading-relaxed">
                  {update.fixes.map((fix, i) => (
                    <li key={i}>{fix}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Updates;