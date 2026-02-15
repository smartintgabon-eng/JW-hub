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
  },
  {
    version: "1.3.0",
    date: "27 Octobre 2024",
    features: [
      "Passage de l'appel à l'IA du frontend vers une API Route Vercel (serverless function) pour un 'grounding' (ancrage des réponses) beaucoup plus fiable et sécurisé. L'IA accède désormais réellement aux informations de jw.org sans les limitations du navigateur.",
      "Utilisation du modèle Gemini 2.5 Flash pour toutes les requêtes (Tour de Garde, Cahier, Prédication) pour des réponses rapides et précises.",
      "Les prompts de l'IA sont encore plus précis pour la demande de versets bibliques complets (Traduction du Monde Nouveau) et des références exactes aux publications."
    ],
    fixes: [
      "Correction de l'erreur 'Unexpected token <' / 'A server e' lors de l'appel à l'API, due à une mauvaise configuration de `vercel.json` qui redirigeait les appels API vers la page `index.html`. Le routage est maintenant correct.",
      "Amélioration de la robustesse de l'API Route Vercel pour mieux gérer les erreurs et les quotas, renvoyant des messages d'erreur JSON clairs au client.",
      "Nettoyage des fichiers dupliqués ou mal placés suite à la migration vers une structure de projet standard React/Vercel (fichiers à la racine, etc.)."
    ]
  },
  {
    version: "1.4.0",
    date: "28 Octobre 2024",
    features: [
      "Amélioration de la gestion des erreurs API côté frontend avec des messages plus spécifiques et compréhensibles, notamment pour les quotas et les problèmes de connexion."
    ],
    fixes: [
      "Correction définitive de l'erreur 'Unexpected token <' / 'is not valid JSON' en ajustant les règles de réécriture dans `vercel.json`. Le trafic API est maintenant correctement dirigé vers la fonction serverless de Vercel.",
      "Optimisation de la gestion du Service Worker pour s'assurer que les appels vers l'API Route Vercel ne sont jamais mis en cache par erreur."
    ]
  },
  {
    version: "1.5.0",
    date: "29 Octobre 2024",
    features: [
      "Amélioration de la robustesse de la communication avec l'API Gemini, notamment en cas de surcharge des services Google."
    ],
    fixes: [
      "Nouvelle correction des problèmes persistants de routage sur Vercel (`vercel.json`) qui causaient l'erreur 'Unexpected token <' / 'is not valid JSON'. Le déploiement est maintenant plus stable.",
      "Instructions détaillées ajoutées au tutoriel et aux messages d'erreur pour aider l'utilisateur à vider le cache du navigateur ou à réinstaller la PWA en cas de problèmes de déploiement côté client.",
      "La version du Service Worker a été incrémentée (`v10`) pour forcer la mise à jour des règles de cache chez tous les utilisateurs."
    ]
  },
  {
    version: "1.6.0",
    date: "30 Octobre 2024",
    features: [
      "Amélioration des diagnostics des erreurs API côté serveur avec des logs explicites sur Vercel, et messages d'erreur frontend plus précis."
    ],
    fixes: [
      "Tentative de correction finale de l'erreur 'Unexpected token <' / 'is not valid JSON' en affinant la gestion d'erreurs côté serveur et en fournissant des instructions de débogage et de nettoyage de cache approfondies.",
      "La version du Service Worker a été incrémentée (`v11`) pour garantir que les dernières règles de cache et de routage sont appliquées, en insistant sur la nécessité de vider le cache du navigateur et de réinstaller la PWA."
    ]
  },
  {
    version: "1.7.0",
    date: "14 Février 2025",
    features: [
      "Amélioration de la compatibilité des fonctions serverless Vercel avec le module `@google/genai`."
    ],
    fixes: [
      "Correction de l'erreur `Cannot find module '/var/task/node_modules/@google/genai/dist/node/index.cjs'` sur Vercel en ajoutant `'type': 'module'` au `package.json` et en assurant la cohérence de la version `@google/genai`. Ceci résout le problème où l'API renvoyait une erreur HTML (`Unexpected token 'A'`) au lieu de JSON.",
      "Instructions de dépannage mises à jour dans le tutoriel et les messages d'erreur, insistant sur le nettoyage du cache de build de Vercel et le cache du navigateur/PWA."
    ]
  },
  {
    version: "1.8.0",
    date: "15 Février 2025",
    features: [
      "**Amélioration majeure du 'grounding' de l'IA** pour les études 'Cahier Vie et Ministère' et 'Tour de Garde' : l'IA utilise désormais systématiquement l'outil Google Search pour extraire les informations directement des publications jw.org, garantissant des réponses fidèles et non inventées, même avec un lien direct.",
      "**Nouvelle fonctionnalité : Masquer/Afficher la barre latérale** de navigation sur ordinateur (desktop). Un bouton de bascule est disponible pour passer d'une vue étendue à une vue icône-seulement, maximisant l'espace de lecture. L'état est sauvegardé.",
      "**Amélioration de la recherche par date/thème** pour 'Cahier Vie et Ministère' et 'Tour de Garde' : le champ unique est remplacé par deux champs distincts ('Date de début de semaine (JJ/MM/AAAA)' et 'Thème principal (facultatif)') pour une recherche plus précise."
    ],
    fixes: [
      "Stabilisation des requêtes API en forçant l'utilisation de l'outil Google Search pour toutes les requêtes basées sur des contenus externes (liens ou recherches par mots-clés) pour assurer une meilleure fidélité des réponses de l'IA.",
      "La version du Service Worker a été incrémentée (`v13`) pour garantir la mise à jour des dernières règles de cache et fonctionnalités chez tous les utilisateurs."
    ]
  },
  {
    version: "1.9.0",
    date: "15 Février 2025",
    features: [
      "**Correction majeure du 'Deep Research' pour les liens directs** dans 'Cahier Vie et Ministère' et 'Tour de Garde' : l'application scrape désormais directement le texte des URLs fournies côté serveur (utilisant Cheerio) et envoie ce contenu brut à Gemini. Cela garantit que l'IA ne 'devine' plus, mais lit et répond strictement à partir de la publication originale.",
      "Amélioration de la fiabilité des réponses : suppression de l'invention de contenu et garantie de la fidélité aux sources, pour les requêtes basées sur des liens.",
      "Affinement de la logique de recherche : l'outil Google Search est désormais utilisé uniquement pour les recherches par mots-clés/thèmes, tandis que les liens sont lus directement."
    ],
    fixes: [
      "Correction du problème où l'IA 'inventait' les réponses pour les liens directs dans les onglets 'Cahier' et 'Tour de Garde', en mettant en place un mécanisme de scraping de contenu côté serveur.",
      "Amélioration des messages d'erreur en cas d'échec de l'extraction de contenu (scraping) depuis une URL.",
      "La version du Service Worker a été incrémentée (`v14`) pour garantir la mise à jour des dernières règles de cache et fonctionnalités chez tous les utilisateurs."
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