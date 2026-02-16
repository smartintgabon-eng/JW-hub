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
  },
  {
    version: "1.9.1",
    date: "15 Février 2025",
    features: [
      "Amélioration de la robustesse du 'Deep Research' (scraping) pour les liens directs, rendant la récupération de contenu plus fiable."
    ],
    fixes: [
      "Correction de l'erreur 'fetch failed' lors de l'extraction de contenu : ajout d'en-têtes HTTP (User-Agent, Referer) aux requêtes de scraping pour simuler un navigateur et améliorer la compatibilité avec les sites web. Les messages d'erreur ont été affinés pour mieux diagnostiquer les problèmes de connexion.",
      "La version du Service Worker a été incrémentée (`v15`) pour garantir la mise à jour des dernières règles et améliorations chez tous les utilisateurs."
    ]
  },
  {
    version: "1.9.2",
    date: "16 Février 2025",
    features: [
      "**Amélioration de la compatibilité mobile** pour la barre latérale de navigation : elle s'adapte mieux aux petits écrans de téléphone en mode portrait.",
      "**Ajout d'un bouton 'Confirmer les modifications'** dans les paramètres : vos préférences (couleurs, préférences de l'IA) ne sont appliquées et sauvegardées qu'après avoir cliqué sur ce bouton, avec un retour visuel 'Enregistré !' temporaire.",
      "Amélioration de la robustesse du 'Deep Research' (scraping) des liens directs, avec des en-têtes de requête HTTP plus complets pour mieux simuler un navigateur."
    ],
    fixes: [
      "Correction de l'erreur 'Erreur de connexion lors de l'extraction de l'URL' en optimisant les en-têtes HTTP du `fetch` de scraping. Les messages d'erreur ont été rendus plus spécifiques pour aider à diagnostiquer les problèmes de blocage réseau ou les réponses HTTP du serveur cible.",
      "La version du Service Worker a été incrémentée (`v16`) pour garantir la mise à jour des dernières règles et améliorations chez tous les utilisateurs."
    ]
  },
  {
    version: "1.9.3",
    date: "16 Février 2025",
    features: [
      "**Amélioration de l'expérience utilisateur sur mobile** : la barre latérale s'adapte de manière optimale aux petits écrans. Le contenu des pages s'ajuste dynamiquement pour tirer pleinement parti de l'espace disponible, améliorant la lisibilité sans nécessiter de zoom manuel."
    ],
    fixes: [
      "Correction de l'erreur persistante 'Erreur de connexion lors de l'extraction de l'URL' en fournissant un message d'erreur plus clair indiquant le probable blocage par `jw.org` et suggérant l'alternative de la 'Recherche par date/thème'.",
      "Correction de la compatibilité de la barre latérale sur les petits téléphones : ajustement de la largeur pour éviter le débordement et améliorer l'esthétique.",
      "Optimisation de l'affichage du contenu principal sur mobile pour éviter les problèmes de 'dézoom' et garantir une meilleure adaptabilité à la largeur de l'écran.",
      "Mise à jour de la version de Cheerio et ajout de Lodash dans `package.json` pour la cohérence des dépendances.",
      "La version du Service Worker a été incrémentée (`v17`) pour garantir la mise à jour des dernières règles et améliorations chez tous les utilisateurs."
    ]
  },
  {
    version: "1.9.4",
    date: "16 Février 2025",
    features: [
      "**Robustesse améliorée pour l'analyse des liens directs de jw.org** : Le scraping côté serveur est maintenant renforcé avec des en-têtes HTTP encore plus sophistiqués pour simuler un navigateur mobile. En cas d'échec, un mécanisme de fallback utilise directement l'outil `googleSearch` de Gemini pour tenter d'analyser le contenu du lien, capitalisant sur l'accès plus large de Google au web. Ceci maximise les chances d'obtenir des réponses fiables même face à des blocages.",
      "**Messages d'erreur plus clairs** : Les messages d'erreur relatifs au scraping des liens directs sont désormais plus explicites, indiquant quand `jw.org` bloque probablement les requêtes et suggérant d'utiliser la 'Recherche par date/thème' comme alternative fiable."
    ],
    fixes: [
      "Correction de l'erreur 'Erreur de connexion lors de l'extraction de l'URL' en implémentant une stratégie de scraping en deux phases (direct puis via Gemini Google Search) et en affinant les messages d'erreur.",
      "Mise à jour de la version du Service Worker (`v18`) pour assurer la distribution des dernières améliorations de manière fiable."
    ]
  },
  {
    version: "1.9.5",
    date: "16 Février 2025",
    features: [
      "**Optimisation du 'Deep Research' pour les liens directs de jw.org** : Le scraping du contenu est désormais ciblé sur les éléments clés (<p>, titres, listes) pour réduire la taille des données et accélérer le traitement. Un délai de 500ms est introduit avant le scraping pour une meilleure simulation humaine.",
      "**Feedback utilisateur amélioré** : Le bouton 'Générer les réponses' affiche 'Analyse en cours...' pendant que l'IA traite le contenu, offrant un meilleur indicateur de progression."
    ],
    fixes: [
      "Correction des problèmes de `FUNCTION_INVOCATION_TIMEOUT` ou `500-LINK-BLOCKED` sur Vercel en réduisant drastiquement le volume de texte scrapé et en ajoutant un délai, ce qui devrait permettre aux fonctions serverless de terminer leur exécution dans les temps.",
      "Messages d'erreur API affinés pour mieux informer l'utilisateur des blocages potentiels par jw.org et recommander la 'Recherche par date/thème' comme solution de repli.",
      "La version du Service Worker a été incrémentée (`v19`) pour garantir la distribution fiable de ces améliorations."
    ]
  },
  {
    version: "1.9.6",
    date: "17 Février 2025",
    features: [
      "**Amélioration de la fiabilité du 'Deep Research' de jw.org** : Le scraping du contenu est encore plus ciblé (paragraphes, titres, listes) et inclut un délai de 500ms pour imiter un comportement humain, réduisant les risques de blocage. En cas d'échec du scraping direct, l'outil `googleSearch` de Gemini est instruit de rechercher le texte **intégral** pour obtenir la structure par paragraphe.",
      "**Affichage des réponses plus lisible** : Les questions de l'IA dans l'historique sont désormais mises en gras avec une couleur distinctive, et un espacement adéquat est ajouté entre les sections pour une meilleure lisibilité sur tous les écrans.",
      "**Optimisation de l'affichage mobile** : La barre latérale est affinée à `75vw` (max 280px) et les pages principales prennent désormais 100% de la largeur sur les petits écrans, évitant le problème de 'dézoom' et rendant l'expérience plus fluide et agréable."
    ],
    fixes: [
      "Correction des problèmes de `FUNCTION_INVOCATION_TIMEOUT` et `500-LINK-BLOCKED` en affinant le scraping et le fallback Gemini pour réduire la charge de traitement et contourner les blocages de jw.org plus efficacement.",
      "Correction de l'affichage mobile où la barre latérale était trop large et le contenu principal ne prenait pas toute la largeur, résolvant les problèmes de 'dézoom' et de lisibilité.",
      "Mise à jour de la version du Service Worker (`v20`) pour assurer la distribution fiable de ces améliorations."
    ]
  },
  {
    version: "1.9.7",
    date: "17 Février 2025",
    features: [
      "**Fiabilité accrue pour l'analyse des liens jw.org** : Le scraping direct est désormais abandonné au profit d'une utilisation exclusive de l'outil `googleSearch` de Gemini. L'IA est instruite de 'cliquer virtuellement' sur les liens et d'extraire le texte intégral avec une structure paragraphe par paragraphe.",
      "**Mises à jour de l'application automatiques et non-disruptives** : L'application détecte et installe automatiquement les nouvelles versions en arrière-plan. La page se rechargera pour appliquer les mises à jour sans effacer l'historique ou les paramètres de l'utilisateur.",
      "**Amélioration de l'interface mobile** : La barre latérale est désormais entièrement masquée et ne prend plus d'espace ni ne se superpose au contenu principal lorsqu'elle est fermée. Le contenu des pages s'adapte encore mieux pour occuper toute la largeur disponible sur les petits écrans."
    ],
    fixes: [
      "Résolution des erreurs `500-LINK-BLOCKED` et `FUNCTION_INVOCATION_TIMEOUT` en simplifiant la méthode d'extraction de contenu des liens `jw.org`, réduisant la charge serveur et les risques de blocage.",
      "Correction des problèmes de superposition de la barre latérale sur mobile et de la largeur du contenu principal, offrant une expérience utilisateur plus propre et intuitive.",
      "Implémentation d'un mécanisme de mise à jour automatique via le Service Worker (`skipWaiting`, `clientsClaim` et `controllerchange` listener) pour éviter les réinitialisations manuelles.",
      "Mise à jour de la version du Service Worker (`v21`) pour garantir la distribution fiable de ces améliorations."
    ]
  },
  {
    version: "1.9.8",
    date: "18 Février 2025",
    features: [
      "**Mises à jour intelligentes du Service Worker** : L'application détecte désormais une nouvelle version du Service Worker et affiche un bouton 'Mettre à jour l'App' pour permettre à l'utilisateur de déclencher la mise à jour sans perdre ses données locales.",
      "**Bouton 'Installer l'App' plus accessible** : Le bouton d'installation de la PWA est maintenant visible dans la barre latérale sur mobile lorsqu'elle est ouverte, améliorant la découvrabilité.",
      "**Nettoyage des dépendances et fichiers obsolètes** : Suppression des modules inutilisés comme `cheerio` et des fichiers redondants pour alléger l'application et prévenir les conflits."
    ],
    fixes: [
      "Finalisation de la logique de mise à jour du Service Worker pour une transition plus fluide et sans perte de données.",
      "Correction des problèmes persistants de superposition de la barre latérale mobile en affinant les classes CSS pour la rendre complètement invisible lorsqu'elle est fermée.",
      "Suppression de la dépendance `cheerio` qui n'est plus utilisée, résolvant d'éventuels problèmes de compatibilité ou d'empreinte."
    ]
  },
  {
    version: "1.9.9",
    date: "19 Février 2025",
    features: [
      "**Fiabilité maximale de l'analyse des liens jw.org** : Le système utilise désormais un proxy gratuit (AllOrigins) combiné à `cheerio` pour récupérer et nettoyer le contenu des pages jw.org. Ce texte brut est ensuite envoyé à Gemini pour une analyse précise. L'outil Google Search de Gemini reste un filet de sécurité si le proxy échoue.",
      "**Gestion améliorée des mises à jour** : Les mises à jour de l'application sont désormais plus visibles et contrôlées par l'utilisateur. Un bouton 'Mettre à jour l'App' apparaît quand une nouvelle version est prête, permettant une mise à jour manuelle sans perte de données.",
      "**Restauration complète de la stabilité de l'application** : Correction des erreurs critiques qui causaient l'écran noir et les problèmes d'affichage. Les fichiers essentiels ont été restaurés et les dépendances inutilisées supprimées pour une application plus propre et plus robuste."
    ],
    fixes: [
      "Résolution de l'écran noir et des erreurs de compilation/exécution en restaurant les fichiers `src/index.tsx` et `src/types.ts`.",
      "Correction des problèmes de superposition de la barre latérale sur mobile en affinant les classes CSS pour un masquage et un positionnement corrects.",
      "Suppression définitive des fichiers redondants et inutiles (`index.tsx` à la racine, `types.ts` à la racine, etc.) pour simplifier la structure du projet.",
      "Mise à jour du Service Worker (`v23`) et de la logique de l'application pour une détection et une application des mises à jour fiables et non-destructrices."
    ]
  },
  {
    version: "2.0.0",
    date: "20 Février 2025",
    features: [
      "**Amélioration majeure du 'Grounding' de l'IA (Tour de Garde)** : Le prompt de Gemini a été rendu plus 'autoritaire', lui interdisant de refuser l'analyse et l'autorisant à utiliser ses connaissances pour combler les lacunes si le texte via le proxy est insuffisant. Le ciblage Cheerio a été affiné pour mieux extraire les questions et paragraphes.",
      "**Design Mobile 'XGest' appliqué** : La barre latérale sur mobile se comporte désormais comme l'interface 'xgest' : elle est totalement cachée par défaut en mode portrait, glisse par-dessus le contenu en s'ouvrant, et un fond semi-transparent bloque le reste de l'écran. Les icônes sans texte sont affichées lorsque la barre est réduite sur desktop et lorsque l'écran est plus grand."
    ],
    fixes: [
      "Correction de l'affichage en mode portrait sur mobile : la barre latérale ne pousse plus le contenu et s'affiche correctement en superposition, occupant une largeur optimale.",
      "Amélioration de la résilience de l'IA face au texte fragmenté : les instructions strictes dans le prompt réduisent les messages d'erreur de 'texte non accessible' et forcent la génération de réponses structurées."
    ]
  }
];

const Updates: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-5xl mx-auto">
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