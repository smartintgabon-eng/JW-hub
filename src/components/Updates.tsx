import React from 'react';
import { BellRing, CheckCircle, Bug, Rocket } from 'lucide-react';

interface UpdateItem {
  version: string;
  date: string;
  features: string[];
  fixes: string[];
  featureId?: string; // Optional field to link to tutorial steps
}

const updates: UpdateItem[] = [
  {
    version: "2.0.5",
    date: "24 Février 2025",
    features: [
      "**PWA Complète** : L&apos;application est désormais une Progressive Web App entièrement configurée, installable sur Android (WebAPK) et iOS, avec un `manifest.json` à jour et un Service Worker (`sw.js`) robuste pour le cache des assets et l&apos;expérience hors ligne.",
      "**Thème Dynamique Intelligent** : Le texte et les boutons s&apos;adaptent automatiquement en noir ou blanc en fonction de la couleur de fond choisie, garantissant une lisibilité optimale et un contraste parfait.",
      "**Suggestion de Cantiques par l&apos;IA** : Lors de la génération de discours, l&apos;IA propose désormais un cantique pertinent de la bibliothèque &apos;Chantons joyeusement&apos; de jw.org, incluant le titre et le lien direct.",
      "**Analyse de Couleurs par l&apos;IA** : Dans les paramètres, l&apos;IA peut maintenant &apos;deviner&apos; et décrire une couleur (nom ou code hexadécimal) pour aider l&apos;utilisateur à choisir ses thèmes visuels."
    ],
    fixes: [
      "**Correction de la Recherche Hybride** : Amélioration de la gestion des erreurs pour la recherche hybride, empêchant les crashs dus aux réponses non-JSON (pages d&apos;erreur HTML) de l&apos;API.",
      "**Fiabilité des Mises à Jour** : Le Service Worker a été mis à jour pour assurer une mise en cache correcte des nouvelles icônes PWA et du logo du site."
    ]
  },

  {
    version: "2.0.4",
    date: "23 Février 2025",
    features: [
      "**Nouvel Onglet : Recherches Avancées** : L&apos;utilisateur peut maintenant poser une question ou un sujet. L&apos;IA fouille `jw.org` et `wol.jw.org` via Google Search, présente d&apos;abord les textes bruts des sources trouvées, ensuite une explication détaillée de l&apos;IA (expliquant sa démarche), et enfin une liste de tous les liens utilisés. La méthode de recherche combine Gemini 2.5 Flash, Google Search, et le scraping/grounding.",
      "**Méthode de Recherche Appliquée à la Prédication** : La puissante méthode de recherche introduite dans l&apos;onglet &apos;Recherches&apos; est désormais également utilisée pour tous les types de préparation de prédication (porte-en-porte, nouvelles visites, cours bibliques), garantissant des réponses complètes et entièrement sourcées.",
      "**Amélioration de l&apos;UI Mobile (XGest)** : La barre latérale sur mobile a été totalement refondue pour adopter le design &apos;xgest&apos;. Elle est désormais `fixed`, `height: 100vh`, `width: 80%`, avec un `z-index` très élevé, et un fond semi-transparent (overlay) apparaît derrière quand elle est ouverte pour bloquer les interactions avec le contenu principal.",
      "**Relocalisation des Boutons d&apos;Action** : Les boutons &apos;Installer l&apos;App&apos; et &apos;Mettre à jour l&apos;App&apos; ont été déplacés et sont maintenant centrés dans l&apos;espace vide de la barre latérale quand elle est étendue, pour une meilleure visibilité et un design plus épuré."
    ],
    fixes: [
      "Correction des problèmes d&apos;affichage en mode portrait sur mobile : la barre latérale ne pousse plus le contenu, s&apos;affiche correctement en superposition et occupe une largeur optimale.",
      "Amélioration de la fiabilité du Service Worker pour la PWA : correction du `manifest.json` avec `purpose: maskable` pour les icônes, et `public/sw.js` pour un cache complet des polices Google Fonts et une meilleure gestion des requêtes, rétablissant l&apos;installabilité PWA et l&apos;accès hors ligne.",
      "L&apos;en-tête mobile a été épuré : le texte &apos;JW Study&apos; et le bouton de menu &apos;hamburger&apos; ont été supprimés et le bouton de menu a été intégré dans la barre latérale mobile pour déclencher son ouverture/fermeture.",
      "Le prompt de l&apos;IA pour la Tour de Garde a été rendu plus &apos;autoritaire&apos;, lui interdisant de refuser l&apos;analyse et l&apos;autorisant à utiliser ses connaissances pour combler les lacunes si le texte via le proxy est insuffisant. Le ciblage Cheerio a été affiné pour mieux extraire les questions et paragraphes.",
      "Les champs de liens dans les onglets &apos;Cahier&apos;, &apos;Tour de Garde&apos; et &apos;Prédication&apos; sont maintenant correctement gérés, avec des labels &apos;(Optionnel)&apos; lorsque c&apos;est le cas."
    ]
  },
  {
    version: "2.0.3",
    date: "22 Février 2025",
    features: [
      "**Personnalisation des liens par onglet** : L&apos;onglet &apos;Tour de Garde&apos; a maintenant un champ de lien unique. L&apos;onglet &apos;Cahier Vie et Ministère&apos; conserve le multi-liens (max 8) pour les articles de référence de l&apos;Étude Biblique de l&apos;Assemblée, avec une icône d&apos;aide. L&apos;onglet &apos;Prédication&apos; a des champs de liens facultatifs avec la mention &apos;(Optionnel)&apos;.",
      "**Tutoriel Virtuel Exhaustif** : Le &apos;Tutoriel&apos; est un miroir exact des capacités du site, avec des démos cliquables (multi-liens, générer) et des animations. Un bouton &apos;Aide à l&apos;installation PWA&apos; fournit des instructions OS-spécifiques. Le format &apos;Story&apos; est utilisé sur mobile.",
      "**Synchronisation Tutoriel/Mises à jour** : Les nouvelles fonctionnalités sont liées aux étapes du tutoriel pour une découverte prioritaire (implémentation conceptuelle des `featureId`)."
    ],
    fixes: [
      "Amélioration de la gestion des états de liens dans `StudyTool.tsx` pour s&apos;adapter aux différents types d&apos;onglets.",
      "Correction des styles et du comportement du tutoriel pour une meilleure interactivité et adaptabilité mobile."
    ]
  },
  {
    version: "2.0.2",
    date: "22 Février 2025",
    features: [
      "**Tutoriel Virtuel Interactif** : L&apos;onglet &apos;Tutoriel&apos; a été transformé en un simulateur interactif des fonctions clés (saisie multi-liens, boutons, mode lecture) avec des &apos;Démos&apos; cliquables et des animations pour guider l&apos;utilisateur. Un bouton &apos;Lancer la visite guidée (Démo)&apos; a été ajouté pour illustrer le concept de bulles d&apos;aide.",
      "**Aide à l&apos;Installation PWA Intelligente** : Un bouton &apos;Aide à l&apos;installation&apos; dans le tutoriel détecte le système d&apos;exploitation (iOS/Android) de l&apos;utilisateur et affiche des instructions textuelles spécifiques pour installer l&apos;application PWA.",
      "**Amélioration du Design Mobile** : L&apos;en-tête mobile a été épuré. Le titre &apos;JW Study&apos; apparaît désormais à côté du bouton de menu (hamburger) à gauche, laissant plus d&apos;espace et évitant les surcharges visuelles."
    ],
    fixes: [
      "Correction du positionnement de la logique `beforeinstallprompt` dans `App.tsx` pour une détection plus précoce et fiable du bouton d&apos;installation PWA.",
      "Amélioration de la gestion du cache du Service Worker pour garantir une expérience hors ligne plus complète et visuellement cohérente, incluant CSS et polices."
    ]
  },
  {
    version: "2.0.1",
    date: "21 Février 2025",
    features: [
      "**Saisie multi-liens (Tour de Garde et Cahier)** : Le champ URL unique a été remplacé par une zone de texte permettant de coller jusqu&apos;à 8 liens d&apos;articles JW.ORG (1 par ligne). L&apos;API les scrape tous via le proxy AllOrigins et combine le texte pour l&apos;analyse par Gemini.",
      "**Détection automatique du type d&apos;article** : L&apos;API détecte désormais automatiquement le type d&apos;article (Tour de Garde, Cahier Vie et Ministère, etc.) à partir des liens. Gemini adapte sa structure de réponse et son ton en conséquence, offrant des réponses plus pertinentes.",
      "**Amélioration de l&apos;Hybrid Intelligence&apos;** : Le serveur scrape le texte via AllOrigins. Si le contenu est court (< 2000 caractères), Gemini active automatiquement l&apos;outil Google Search pour compléter les informations manquantes, garantissant des réponses complètes et fidèles.",
      "**Affichage des résultats responsif** : Les résultats et l&apos;historique utilisent une grille CSS adaptative (1 à 3 colonnes) pour un affichage optimal sur mobile, tablette et desktop.",
      "**PWA améliorée** : L&apos;installation PWA est plus fiable avec une détection précoce du prompt. Le mode hors-ligne est visuellement identique au mode en ligne grâce à un meilleur cache du Service Worker."
    ],
    fixes: [
      "Correction de la barre latérale mobile : elle ne masque plus le titre &apos;JW Study&apos; et s&apos;affiche comme un menu burger en haut à gauche.",
      "Résolution des problèmes d&apos;installation PWA : le `manifest.json` est vérifié et la détection du prompt d&apos;installation est optimisée.",
      "Amélioration du cache du Service Worker pour inclure toutes les feuilles de style et polices de caractères, garantissant un design cohérent hors ligne."
    ]
  },
  {
    version: "2.0.0",
    date: "20 Février 2025",
    features: [
      "**Amélioration majeure du &apos;Grounding&apos; de l&apos;IA (Tour de Garde)** : Le prompt de Gemini a été rendu plus &apos;autoritaire&apos;, lui interdisant de refuser l&apos;analyse et l&apos;autorisant à utiliser ses connaissances pour combler les lacunes si le texte via le proxy est insuffisant. Le ciblage Cheerio a été affiné pour mieux extraire les questions et paragraphes.",
      "**Design Mobile &apos;XGest&apos; appliqué** : La barre latérale sur mobile se comporte désormais comme l&apos;interface &apos;xgest&apos; : elle est totalement cachée par défaut en mode portrait, glisse par-dessus le contenu en s&apos;ouvrant, et un fond semi-transparent bloque le reste de l&apos;écran. Les icônes sans texte sont affichées lorsque la barre est réduite sur desktop et lorsque l&apos;écran est plus grand."
    ],
    fixes: [
      "Correction de l&apos;affichage en mode portrait sur mobile : la barre latérale ne pousse plus le contenu et s&apos;affiche correctement en superposition, occupant une largeur optimale.",
      "Amélioration de la résilience de l&apos;IA face au texte fragmenté : les instructions strictes dans le prompt réduisent les messages d&apos;erreur de &apos;texte non accessible&apos; et forcent la génération de réponses structurées."
    ]
  },
  {
    version: "1.9.9",
    date: "19 Février 2025",
    features: [
      "**Fiabilité maximale de l&apos;analyse de liens jw.org** : Le système utilise désormais un proxy gratuit (AllOrigins) combiné à `cheerio` pour récupérer et nettoyer le contenu des pages jw.org. Ce texte brut est ensuite envoyé à Gemini pour une analyse précise. L&apos;outil Google Search de Gemini reste un filet de sécurité si le proxy échoue.",
      "**Gestion améliorée des mises à jour** : Les mises à jour de l&apos;application sont désormais plus visibles et contrôlées par l&apos;utilisateur. Un bouton &apos;Mettre à jour l&apos;App&apos; apparaît quand une nouvelle version est prête, permettant une mise à jour manuelle sans perte de données.",
      "**Restauration complète de la stabilité de l&apos;application** : Correction des erreurs critiques qui causaient l&apos;écran noir et les problèmes d&apos;affichage. Les fichiers essentiels ont été restaurés et les dépendances inutilisées supprimées pour une application plus propre et plus robuste."
    ],
    fixes: [
      "Résolution de l&apos;écran noir et des erreurs de compilation/exécution en restaurant les fichiers `src/index.tsx` et `src/types.ts`.",
      "Correction des problèmes de superposition de la barre latérale sur mobile en affinant les classes CSS pour un masquage et un positionnement corrects.",
      "Suppression définitive des fichiers redondants et inutiles (`index.tsx` à la racine, `types.ts` à la racine, etc.) pour simplifier la structure du projet.",
      "Mise à jour du Service Worker (`v23`) et de la logique de l&apos;application pour une détection et une application des mises à jour fiables et non-destructrices."
    ]
  },
  {
    version: "1.9.8",
    date: "18 Février 2025",
    features: [
      "**Mises à jour intelligentes du Service Worker** : L&apos;application détecte désormais une nouvelle version du Service Worker et affiche un bouton &apos;Mettre à jour l&apos;App&apos; pour permettre à l&apos;utilisateur de déclencher la mise à jour sans perdre ses données locales.",
      "**Bouton &apos;Installer l&apos;App&apos; plus accessible** : Le bouton d&apos;installation de la PWA est maintenant visible dans la barre latérale sur mobile lorsqu&apos;elle est ouverte, améliorant la découvrabilité.",
      "**Nettoyage des dépendances et fichiers obsolètes** : Suppression des modules inutilisés comme `cheerio` et des fichiers redondants pour alléger l&apos;application et prévenir les conflits."
    ],
    fixes: [
      "Finalisation de la logique de mise à jour du Service Worker pour une transition plus fluide et sans perte de données.",
      "Correction des problèmes persistants de superposition de la barre latérale mobile en affinant les classes CSS pour la rendre complètement invisible lorsqu&apos;elle est fermée.",
      "Suppression de la dépendance `cheerio` qui n&apos;est plus utilisée, résolvant d&apos;éventuels problèmes de compatibilité ou d&apos;empreinte."
    ]
  },
  {
    version: "1.9.7",
    date: "17 Février 2025",
    features: [
      "**Fiabilité accrue pour l&apos;analyse des liens jw.org** : Le scraping direct est désormais abandonné au profit d&apos;une utilisation exclusive de l&apos;outil `googleSearch` de Gemini. L&apos;IA est instruite de &apos;cliquer virtuellement&apos; sur les liens et d&apos;extraire le texte intégral avec une structure paragraphe par paragraphe.",
      "**Mises à jour de l&apos;application automatiques et non-disruptives** : L&apos;application détecte et installe automatiquement les nouvelles versions en arrière-plan. La page se rechargera pour appliquer les mises à jour sans effacer l&apos;historique ou les paramètres de l&apos;utilisateur.",
      "**Amélioration de l&apos;interface mobile** : La barre latérale est désormais entièrement masquée et ne prend plus d&apos;espace ni ne se superpose au contenu principal lorsqu&apos;elle est fermée. Le contenu des pages s&apos;adapte encore mieux pour occuper toute la largeur disponible sur les petits écrans."
    ],
    fixes: [
      "Résolution des erreurs `500-LINK-BLOCKED` et `FUNCTION_INVOCATION_TIMEOUT` en simplifiant la méthode d&apos;extraction de contenu des liens `jw.org`, réduisant la charge serveur et les risques de blocage.",
      "Correction des problèmes de superposition de la barre latérale sur mobile et de la largeur du contenu principal, offrant une expérience utilisateur plus propre et intuitive.",
      "Implémentation d&apos;un mécanisme de mise à jour automatique via le Service Worker (`skipWaiting`, `clientsClaim` et `controllerchange` listener) pour éviter les réinitialisations manuelles.",
      "Mise à jour de la version du Service Worker (`v21`) pour garantir la distribution fiable de ces améliorations."
    ]
  },
  {
    version: "1.9.6",
    date: "17 Février 2025",
    features: [
      "**Amélioration de la fiabilité du &apos;Deep Research&apos; de jw.org** : Le scraping du contenu est encore plus ciblé (paragraphes, titres, listes) et inclut un délai de 500ms pour imiter un comportement humain, réduisant les risques de blocage. En cas d&apos;échec du scraping direct, l&apos;outil `googleSearch` de Gemini est instruit de rechercher le texte **intégral** pour obtenir la structure par paragraphe.",
      "**Affichage des réponses plus lisible** : Les questions de l&apos;IA dans l&apos;historique sont désormais mises en gras avec une couleur distinctive, et un espacement adéquat est ajouté entre les sections pour une meilleure lisibilité sur tous les écrans.",
      "**Optimisation de l&apos;affichage mobile** : La barre latérale est affinée à `75vw` (max 280px) et les pages principales prennent désormais 100% de la largeur sur les petits écrans, évitant le problème de &apos;dézoom&apos; et rendant l&apos;expérience plus fluide et agréable."
    ],
    fixes: [
      "Correction des problèmes de `FUNCTION_INVOCATION_TIMEOUT` et `500-LINK-BLOCKED` en affinant le scraping et le fallback Gemini pour réduire la charge de traitement et contourner les blocages de jw.org plus efficacement.",
      "Correction de l&apos;affichage mobile où la barre latérale était trop large et le contenu principal ne prenait pas toute la largeur, résolvant les problèmes de &apos;dézoom&apos; et de lisibilité.",
      "Mise à jour de la version du Service Worker (`v20`) pour assurer la distribution fiable de ces améliorations."
    ]
  },
  {
    version: "1.9.5",
    date: "16 Février 2025",
    features: [
      "**Optimisation du &apos;Deep Research&apos; pour les liens directs de jw.org** : Le scraping du contenu est désormais ciblé sur les éléments clés (<p>, titres, listes) pour réduire la taille des données et accélérer le traitement. Un délai de 500ms est introduit avant le scraping pour une meilleure simulation humaine.",
      "**Feedback utilisateur amélioré** : Le bouton &apos;Générer les réponses&apos; affiche &apos;Analyse en cours...&apos; pendant que l&apos;IA traite le contenu, offrant un meilleur indicateur de progression."
    ],
    fixes: [
      "Correction des problèmes de `FUNCTION_INVOCATION_TIMEOUT` ou `500-LINK-BLOCKED` sur Vercel en réduisant drastiquement le volume de texte scrapé et en ajoutant un délai, ce qui devrait permettre aux fonctions serverless de terminer leur exécution dans les temps.",
      "Messages d&apos;erreur API affinés pour mieux informer l&apos;utilisateur des blocages potentiels par jw.org et recommander la &apos;Recherche par date/thème&apos; comme solution de repli.",
      "La version du Service Worker a été incrémentée (`v19`) pour garantir la distribution fiable de ces améliorations."
    ]
  },
  {
    version: "1.9.4",
    date: "16 Février 2025",
    features: [
      "**Robustesse améliorée pour l&apos;analyse des liens directs de jw.org** : Le scraping côté serveur est maintenant renforcé avec des en-têtes HTTP encore plus sophistiqués pour simuler un navigateur mobile. En cas d&apos;échec, un mécanisme de fallback utilise directement l&apos;outil `googleSearch` de Gemini pour tenter d&apos;analyser le contenu du lien, capitalisant sur l&apos;accès plus large de Google au web. Ceci maximise les chances d&apos;obtenir des réponses fiables même face à des blocages.",
      "**Messages d&apos;erreur plus clairs** : Les messages d&apos;erreur relatifs au scraping des liens directs sont désormais plus explicites, indiquant quand `jw.org` bloque probablement les requêtes et suggérant d&apos;utiliser la &apos;Recherche par date/thème&apos; comme alternative fiable."
    ],
    fixes: [
      "Correction de l&apos;erreur &apos;Erreur de connexion lors de l&apos;extraction de l&apos;URL&apos; en implémentant une stratégie de scraping en deux phases (direct puis via Gemini Google Search) et en affinant les messages d&apos;erreur.",
      "Mise à jour de la version du Service Worker (`v18`) pour assurer la distribution des dernières améliorations de manière fiable."
    ]
  },
  {
    version: "1.9.3",
    date: "16 Février 2025",
    features: [
      "**Amélioration de l&apos;expérience utilisateur sur mobile** : la barre latérale s&apos;adapte de manière optimale aux petits écrans. Le contenu des pages s&apos;ajuste dynamiquement pour tirer pleinement parti de l&apos;espace disponible, améliorant la lisibilité sans nécessiter de zoom manuel."
    ],
    fixes: [
      "Correction de l&apos;erreur persistante &apos;Erreur de connexion lors de l&apos;extraction de l&apos;URL&apos; en fournissant un message d&apos;erreur plus clair indiquant le probable blocage par `jw.org` et suggérant l&apos;alternative de la &apos;Recherche par date/thème&apos;.",
      "Correction de la compatibilité de la barre latérale sur les petits téléphones : ajustement de la largeur pour éviter le débordement et améliorer l&apos;esthétique.",
      "Optimisation de l&apos;affichage du contenu principal sur mobile pour éviter les problèmes de &apos;dézoom&apos; et garantir une meilleure adaptabilité à la largeur de l&apos;écran.",
      "Mise à jour de la version de Cheerio et ajout de Lodash dans `package.json` pour la cohérence des dépendances.",
      "La version du Service Worker a été incrémentée (`v17`) pour garantir la mise à jour des dernières règles et améliorations chez tous les utilisateurs."
    ]
  },
  {
    version: "1.9.2",
    date: "16 Février 2025",
    features: [
      "**Amélioration de la compatibilité mobile** pour la barre latérale de navigation : elle s&apos;adapte mieux aux petits écrans de téléphone en mode portrait.",
      "**Ajout d&apos;un bouton &apos;Confirmer les modifications&apos;** dans les paramètres : vos préférences (couleurs, préférences de l&apos;IA) ne sont appliquées et sauvegardées qu&apos;après avoir cliqué sur ce bouton, avec un retour visuel &apos;Enregistré !&apos; temporaire.",
      "Amélioration de la robustesse du &apos;Deep Research&apos; (scraping) des liens directs, avec des en-têtes de requête HTTP plus complets pour mieux simuler un navigateur."
    ],
    fixes: [
      "Correction de l&apos;erreur &apos;Erreur de connexion lors de l&apos;extraction de l&apos;URL&apos; en optimisant les en-têtes HTTP du `fetch` de scraping. Les messages d&apos;erreur ont été rendus plus spécifiques pour aider à diagnostiquer les problèmes de blocage réseau ou les réponses HTTP du serveur cible.",
      "La version du Service Worker a été incrémentée (`v16`) pour garantir la mise à jour des dernières règles et améliorations chez tous les utilisateurs."
    ]
  },
  {
    version: "1.9.1",
    date: "15 Février 2025",
    features: [
      "Amélioration de la robustesse du &apos;Deep Research&apos; (scraping) pour les liens directs, rendant la récupération de contenu plus fiable."
    ],
    fixes: [
      "Correction de l&apos;erreur &apos;fetch failed&apos; lors de l&apos;extraction de contenu : ajout d&apos;en-têtes HTTP (User-Agent, Referer) aux requêtes de scraping pour simuler un navigateur et améliorer la compatibilité avec les sites web. Les messages d&apos;erreur ont été affinés pour mieux diagnostiquer les problèmes de connexion.",
      "La version du Service Worker a été incrémentée (`v15`) pour garantir la mise à jour des dernières règles et améliorations chez tous les utilisateurs."
    ]
  },
  {
    version: "1.9.0",
    date: "15 Février 2025",
    features: [
      "**Correction majeure du &apos;Deep Research&apos; pour les liens directs** dans &apos;Cahier Vie et Ministère&apos; et &apos;Tour de Garde&apos; : l&apos;application scrape désormais directement le texte des URLs fournies côté serveur (utilisant Cheerio) et envoie ce contenu brut à Gemini. Cela garantit que l&apos;IA ne &apos;devine&apos; plus, mais lit et répond strictement à partir de la publication originale.",
      "Amélioration de la fiabilité des réponses : suppression de l&apos;invention de contenu et garantie de la fidélité aux sources, pour les requêtes basées sur des liens.",
      "Affinement de la logique de recherche : l&apos;outil Google Search est désormais utilisé uniquement pour les recherches par mots-clés/thèmes, tandis que les liens sont lus directement."
    ],
    fixes: [
      "Correction du problème où l&apos;IA &apos;inventait&apos; les réponses pour les liens directs dans les onglets &apos;Cahier&apos; et &apos;Tour de Garde&apos;, en mettant en place un mécanisme de scraping de contenu côté serveur.",
      "Amélioration des messages d&apos;erreur en cas d&apos;échec de l&apos;extraction de contenu (scraping) depuis une URL.",
      "La version du Service Worker a été incrémentée (`v14`) pour garantir la mise à jour des dernières règles de cache et fonctionnalités chez tous les utilisateurs."
    ]
  },
  {
    version: "1.8.0",
    date: "15 Février 2025",
    features: [
      "**Amélioration majeure du &apos;grounding&apos; de l&apos;IA** pour les études &apos;Cahier Vie et Ministère&apos; et &apos;Tour de Garde&apos; : l&apos;IA utilise désormais systématiquement l&apos;outil Google Search pour extraire les informations directement des publications jw.org, garantissant des réponses fidèles et non inventées, même avec un lien direct.",
      "**Nouvelle fonctionnalité : Masquer/Afficher la barre latérale** de navigation sur ordinateur (desktop). Un bouton de bascule est disponible pour passer d&apos;une vue étendue à une vue icône-seulement, maximisant l&apos;espace de lecture. L&apos;état est sauvegardé.",
      "**Amélioration de la recherche par date/thème** pour &apos;Cahier Vie et Ministère&apos; et &apos;Tour de Garde&apos; : le champ unique est remplacé par deux champs distincts (&apos;Date de début de semaine (JJ/MM/AAAA)&apos; et &apos;Thème principal (facultatif)&apos;) pour une recherche plus précise."
    ],
    fixes: [
      "Stabilisation des requêtes API en forçant l&apos;utilisation de l&apos;outil Google Search pour toutes les requêtes basées sur des contenus externes (liens ou recherches par mots-clés) pour assurer une meilleure fidélité des réponses de l&apos;IA.",
      "La version du Service Worker a été incrémentée (`v13`) pour garantir la mise à jour des dernières règles de cache et fonctionnalités chez tous les utilisateurs."
    ]
  },
  {
    version: "1.7.0",
    date: "14 Février 2025",
    features: [
      "Amélioration de la compatibilité des fonctions serverless Vercel avec le module `@google/genai`."
    ],
    fixes: [
      "Correction de l&apos;erreur `Cannot find module &apos;/var/task/node_modules/@google/genai/dist/node/index.cjs&apos;` sur Vercel en ajoutant `&apos;type&apos;: &apos;module&apos;` au `package.json` et en assurant la cohérence de la version `@google/genai`. Ceci résout le problème où l&apos;API renvoyait une erreur HTML (`Unexpected token &apos;A&apos;`) au lieu de JSON.",
      "Instructions de dépannage mises à jour dans le tutoriel et les messages d&apos;erreur, insistant sur le nettoyage du cache de build de Vercel et le cache du navigateur/PWA."
    ]
  },
  {
    version: "1.6.0",
    date: "30 Octobre 2024",
    features: [
      "Amélioration des diagnostics des erreurs API côté serveur avec des logs explicites sur Vercel, et messages d&apos;erreur frontend plus précis."
    ],
    fixes: [
      "Tentative de correction finale de l&apos;erreur &apos;Unexpected token <&apos; / &apos;is not valid JSON&apos; en affinant la gestion d&apos;erreurs côté serveur et en fournissant des instructions de débogage et de nettoyage de cache approfondies.",
      "La version du Service Worker a été incrémentée (`v11`) pour garantir que les dernières règles de cache et de routage sont appliquées, en insistant sur la nécessité de vider le cache du navigateur et de réinstaller la PWA."
    ]
  },
  {
    version: "1.5.0",
    date: "29 Octobre 2024",
    features: [
      "Amélioration de la robustesse de la communication avec l&apos;API Gemini, notamment en cas de surcharge des services Google."
    ],
    fixes: [
      "Nouvelle correction des problèmes persistants de routage sur Vercel (`vercel.json`) qui causaient l&apos;erreur &apos;Unexpected token <&apos; / &apos;is not valid JSON&apos;. Le déploiement est maintenant plus stable.",
      "Instructions détaillées ajoutées au tutoriel et aux messages d&apos;erreur pour aider l&apos;utilisateur à vider le cache du navigateur ou à réinstaller la PWA en cas de problèmes de déploiement côté client.",
      "La version du Service Worker a été incrémentée (`v10`) pour forcer la mise à jour des règles de cache chez tous les utilisateurs."
    ]
  },
  {
    version: "1.4.0",
    date: "28 Octobre 2024",
    features: [
      "Amélioration de la gestion des erreurs API côté frontend avec des messages plus spécifiques et compréhensibles, notamment pour les quotas et les problèmes de connexion."
    ],
    fixes: [
      "Correction définitive de l&apos;erreur &apos;Unexpected token <&apos; / &apos;is not valid JSON&apos; en ajustant les règles de réécriture dans `vercel.json`. Le trafic API est maintenant correctement dirigé vers la fonction serverless de Vercel.",
      "Optimisation de la gestion du Service Worker pour s&apos;assurer que les appels vers l&apos;API Route Vercel ne sont jamais mis en cache par erreur."
    ]
  },
  {
    version: "1.3.0",
    date: "27 Octobre 2024",
    features: [
      "Passage de l&apos;appel à l&apos;IA du frontend vers une API Route Vercel (serverless function) pour un &apos;grounding&apos; (ancrage des réponses) beaucoup plus fiable et sécurisé. L&apos;IA accède désormais réellement aux informations de jw.org sans les limitations du navigateur.",
      "Utilisation du modèle Gemini 2.5 Flash pour toutes les requêtes (Tour de Garde, Cahier, Prédication) pour des réponses rapides et précises.",
      "Les prompts de l&apos;IA sont encore plus précis pour la demande de versets bibliques complets (Traduction du Monde Nouveau) et des références exactes aux publications."
    ],
    fixes: [
      "Correction de l&apos;erreur &apos;Unexpected token <&apos; / &apos;A server e&apos; lors de l&apos;appel à l&apos;API, due à une mauvaise configuration de `vercel.json` qui redirigeait les appels API vers la page `index.html`. Le routage est maintenant correct.",
      "Amélioration de la robustesse de l&apos;API Route Vercel pour mieux gérer les erreurs et les quotas, renvoyant des messages d&apos;erreur JSON clairs au client.",
      "Nettoyage des fichiers dupliqués ou mal placés suite à la migration vers une structure de projet standard React/Vercel (fichiers à la racine, etc.)."
    ]
  },
  {
    version: "1.2.0",
    date: "26 Octobre 2024",
    features: [
      "**Nouveau : Onglet &apos;Prédication&apos;** pour préparer différents types de présentations :",
      "- **Porte-en-porte :** Génération de sujet, entrée en matière, versets et question pour revenir, avec option d&apos;offrir un cours biblique.",
      "- **Nouvelle Visite :** Préparation pour enchaîner un cours biblique ou répondre à une question en suspens, avec proposition systématique d&apos;étude si pertinente.",
      "- **Cours Biblique :** Aide à la préparation de nouveaux chapitres ou à la poursuite d&apos;études en cours.",
      "Amélioration significative du &apos;grounding&apos; de l&apos;IA : instruction plus stricte pour analyser les liens directs ou les résultats de recherche sans invention.",
      "Catégorisation des études dans l&apos;historique pour une meilleure organisation (Cahier, Tour de Garde, Prédication : Porte-en-porte, Nouvelle Visite, Cours Biblique).",
      "Application des préférences de réponses (définies dans les paramètres) à toutes les sections de l&apos;application, y compris la prédication.",
    ],
    fixes: [
      "Correction majeure des exports DOCX et PDF : le contenu est désormais complet, lisible, bien formaté et respecte les couleurs définies dans les paramètres.",
      "Correction du mode lecture : le contenu est visible et le bouton &apos;Fermer&apos; (ou &apos;Quitter le mode lecture&apos;) est toujours accessible pour sortir du mode immersif.",
      "Unification du style de l&apos;application en mode PWA hors ligne, garantissant une expérience visuelle cohérente avec la version en ligne.",
      "Meilleure gestion des erreurs et des quotas API avec des messages plus clairs et des délais de récupération adaptés."
    ]
  },
  {
    version: "1.1.0",
    date: "19 Octobre 2024",
    features: [
      "Amélioration majeure du &apos;grounding&apos; de l&apos;IA pour des réponses plus précises et fidèles aux publications jw.org.",
      "Prise en compte des références bibliques complètes dans les réponses.",
      "Nouvelle structure détaillée pour chaque partie du Cahier Vie et Ministère, basée sur le programme réel : Joyaux, Perles, Applique-toi (tous les exposés), Vie Chrétienne, Étude Biblique de l&apos;Assemblée.",
      "Les questions d&apos;application (pour nous, prédication, famille, etc.) sont désormais uniquement posées pour l&apos;Étude Biblique de l&apos;Assemblée."
    ],
    fixes: [
      "Correction de l&apos;export DOCX/PDF : les réponses sont désormais entièrement visibles et le formatage (gras, italique) est correctement appliqué.",
      "Amélioration des messages de chargement : Un message global indique l&apos;état de la génération et une redirection automatique vers l&apos;historique est effectuée à la fin.",
      "Ajout du bouton &apos;Recommencer la recherche&apos; après l&apos;aperçu de l&apos;article."
    ]
  },
  {
    version: "1.0.0",
    date: "12 Octobre 2024",
    features: [
      "Lancement initial de JW Study Pro.",
      "Génération des réponses pour la Tour de Garde (lien direct ou recherche par date/thème).",
      "Génération des réponses pour le Cahier Vie et Ministère (lien direct ou recherche par date/thème).",
      "Sélection des parties d&apos;étude pour le Cahier Vie et Ministère.",
      "Historique des études générées (stockage local hors ligne).",
      "Mode lecture immersif pour les études.",
      "Personnalisation de l&apos;apparence (couleurs de fond et des boutons).",
      "Installation PWA (Progressive Web App) pour une utilisation hors ligne.",
      "Export des études au format DOCX et PDF."
    ],
    fixes: [
      "Correction des problèmes de compatibilité PWA pour une installation fluide."
    ]
  }
];

const Updates: React.FC = () => {
  // Sort updates by date, most recent first
  const sortedUpdates = [...updates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        {sortedUpdates.map((update, index) => (
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