
import React, { useState } from 'react';
import { HelpCircle, ChevronRight, ChevronLeft, Lightbulb, Link as LinkIcon, Search, Save, Calendar, BookOpen, Settings as SettingsIcon, History as HistoryIcon, Download, BellRing, Megaphone, Server, AlertTriangle } from 'lucide-react';

const Tutorial: React.FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue sur JW Study Pro",
      content: "Cette application est votre assistant personnel pour une préparation approfondie de vos réunions et de votre étude biblique. Elle génère des réponses structurées, des commentaires et des applications pratiques basés sur la Bible Traduction du Monde Nouveau et les publications officielles de jw.org.",
      icon: <HelpCircle className="text-blue-500" size={48} />
    },
    {
      title: "Navigation simple et rapide",
      content: "Utilisez le menu latéral pour passer de l'Accueil aux sections 'Cahier Vie et Ministère' ou 'Tour de Garde', consulter votre 'Historique', accéder aux 'Mises à jour', au 'Tutoriel' ou ajuster les 'Paramètres' de l'application. Sur mobile, le menu se trouve en haut à droite.",
      icon: <Lightbulb className="text-cyan-500" size={48} />
    },
    {
      title: "Architecture Server-side pour un meilleur grounding",
      content: "L'application utilise désormais une architecture 'Server-side' avec les API Routes de Vercel. Cela signifie que les appels à l'IA de Gemini sont gérés sur un serveur sécurisé, ce qui permet à l'IA d'accéder *réellement* et de manière plus fiable aux informations de jw.org (via l'outil Google Search ou par scraping direct) pour générer des réponses plus précises et fidèles. Ce 'grounding' est maintenant appliqué à TOUTES les requêtes de contenu.",
      icon: <Server className="text-gray-400" size={48} />
    },
    {
      title: "Masquer/Afficher la barre latérale (Desktop)",
      content: "Sur ordinateur, vous pouvez désormais masquer ou afficher la barre latérale de navigation. Un bouton en haut à gauche de l'écran vous permet de passer d'une vue détaillée (texte + icônes) à une vue compacte (icônes seulement), pour maximiser l'espace de lecture. L'état est sauvegardé pour vos futures sessions.",
      icon: <ChevronLeft className="text-gray-400" size={48} />
    },
    {
      title: "Préparation de la Tour de Garde : Lecture Profonde des Liens",
      content: "Dans l'onglet 'Tour de Garde', si vous collez le lien direct d'un article de jw.org, l'application va maintenant 'scraper' (extraire) tout le texte de cette page côté serveur et le fournir directement à l'IA. L'IA lira ce texte brut pour vous fournir des réponses ultra-précises, des versets clés (texte complet, Traduction du Monde Nouveau), des commentaires et des applications, sans jamais inventer d'informations. Pour la recherche par date/thème, l'IA utilise l'outil Google Search pour trouver des réponses fiables.",
      icon: <BookOpen className="text-emerald-500" size={48} />
    },
    {
      title: "Préparation du Cahier Vie et Ministère : Lecture Profonde des Liens",
      content: "Comme pour la Tour de Garde, si vous entrez un lien direct vers l'article du Cahier de la semaine, le serveur va en extraire tout le texte. L'IA analysera alors ce contenu en profondeur pour générer des réponses détaillées et fidèles aux publications. Pour la recherche par date/thème, l'IA utilise l'outil Google Search.",
      icon: <LinkIcon className="text-orange-500" size={48} />
    },
    {
      title: "Recherche par date/thème améliorée",
      content: "Lorsque vous choisissez la 'Recherche par date/thème' (pour Cahier ou Tour de Garde), vous disposez maintenant de deux champs distincts : 'Date de début de semaine (JJ/MM/AAAA)' et 'Thème principal (facultatif)'. Utilisez-les pour affiner votre recherche et aider l'IA (via l'outil Google Search) à trouver le contenu le plus pertinent sur jw.org.",
      icon: <Search className="text-indigo-500" size={48} />
    },
    {
      title: "Cahier Vie et Ministère : Choix des parties d'étude",
      content: "Après avoir confirmé l'article, vous pourrez choisir la partie spécifique du Cahier que vous souhaitez préparer : 'Joyaux de la Parole de Dieu', 'Perles Spirituelles', 'Applique-toi au Ministère', 'Vie Chrétienne', 'Étude Biblique de l'Assemblée', ou 'Toutes les parties' pour une préparation complète. Les versets bibliques complets de la Traduction du Monde Nouveau sont désormais inclus.",
      icon: <Calendar className="text-red-500" size={48} />
    },
    {
      title: "Détail : Joyaux de la Parole de Dieu",
      content: "Cette option vous fournira une proposition d'exposé détaillée basée sur les versets et les publications de référence. L'IA générera un thème, une introduction, des points principaux développés avec des références bibliques complètes (Traduction du Monde Nouveau) et une conclusion.",
      icon: <Lightbulb className="text-purple-500" size={48} />
    },
    {
      title: "Détail : Perles Spirituelles",
      content: "Obtenez des réponses concises aux questions, avec les versets clés (texte complet, Traduction du Monde Nouveau), des références de publication, un commentaire d'approfondissement, une application personnelle et une réponse sur les leçons tirées de la lecture biblique.",
      icon: <Lightbulb className="text-yellow-500" size={48} />
    },
    {
      title: "Détail : Applique-toi au Ministère",
      content: "L'IA vous présentera les différents exposés possibles pour la semaine et générera des propositions complètes d'introduction, de points à développer (avec versets bibliques complets, Traduction du Monde Nouveau) et de conclusion pour chacun. Vous pourrez ainsi choisir celui qui vous convient le mieux.",
      icon: <Lightbulb className="text-teal-500" size={48} />
    },
    {
      title: "Détail : Vie Chrétienne",
      content: "Cette section, souvent accompagnée d'une vidéo ou d'un article, vous fournira des réponses aux questions et des points de discussion pertinents, basés sur l'analyse du contenu par l'IA. Elle inclura aussi des applications personnelles. Les versets sont maintenant complets.",
      icon: <Lightbulb className="text-pink-500" size={48} />
    },
    {
      title: "Détail : Étude Biblique de l'Assemblée",
      content: "L'IA répondra aux questions de l'étude (livre/brochure) et, spécifiquement pour cette section, ajoutera des questions d'application pour vous aider à réfléchir sur les leçons personnelles, pour la prédication, la famille, l'assemblée, et sur Jéhovah/Jésus. Les versets sont complets et les réponses plus fidèles.",
      icon: <Lightbulb className="text-lime-500" size={48} />
    },
    {
      title: "Nouvel Onglet : Prédication",
      content: "Préparez vos présentations de prédication (porte-en-porte, nouvelles visites, cours bibliques) avec l'aide de l'IA. Vous pourrez spécifier les publications, les sujets, les questions laissées en suspens, ou votre progression dans un cours pour générer des entrées en matière, des manières de faire et des versets pertinents. Les préférences des réponses de vos paramètres s'appliqueront aussi à cette section. Les études sont catégorisées dans l'historique.",
      icon: <Megaphone className="text-purple-400" size={48} />
    },
    {
      title: "Options après génération : Export & Régénération",
      content: "Une fois les réponses générées, vous pourrez les lire directement sur le site (avec un mode lecture immersif qui masque les distractions), les télécharger au format DOCX ou PDF (avec un formatage amélioré), ou même les régénérer si vous souhaitez une autre perspective ou des détails supplémentaires.",
      icon: <Save className="text-gray-400" size={48} />
    },
    {
      title: "Mises à jour de l'application",
      content: "Consultez le nouvel onglet 'Mises à jour' pour rester informé des dernières fonctionnalités, améliorations et corrections apportées à JW Study Pro. Chaque mise à jour est détaillée pour vous aider à en tirer le meilleur parti.",
      icon: <BellRing className="text-indigo-400" size={48} />
    },
    {
      title: "Personnalisation de l'Apparence",
      content: "Dans les 'Paramètres', vous pouvez changer la couleur de fond et des boutons de l'application. Choisissez parmi nos propositions ou entrez un code hexadécimal personnalisé pour une expérience visuelle unique avec prévisualisation en direct.",
      icon: <SettingsIcon className="text-gray-200" size={48} />
    },
    {
      title: "Historique & Utilisation hors ligne",
      content: "Toutes vos études générées sont automatiquement sauvegardées dans l'onglet 'Historique' de votre appareil (cache local). Cela signifie que vous pouvez y accéder et les consulter même sans connexion internet ! Vous pouvez les supprimer ou les partager à tout moment. Les études sont désormais catégorisées pour faciliter la recherche.",
      icon: <HistoryIcon className="text-blue-400" size={48} />
    },
    {
      title: "Installation de l'application (PWA) & Dépannage",
      content: "Pour profiter pleinement de JW Study Pro et l'utiliser hors ligne, installez-la comme une application web progressive (PWA). Un bouton 'Installer l'App' apparaîtra (généralement dans Chrome) vous permettant de l'ajouter à votre écran d'accueil pour un accès rapide. L'expérience visuelle hors ligne est désormais identique à l'expérience en ligne. **IMPORTANT : En cas de problème persistant après une mise à jour (comme des erreurs d'API inattendues), DÉSINSTALLEZ la PWA, VIDEZ le cache du navigateur (données de site pour jw-hub.vercel.app), puis RÉINSTALLEZ l'application pour garantir le chargement des dernières versions des fichiers.**",
      icon: <Download className="text-green-400" size={48} />
    },
    {
      title: "Vérification et Réinitialisation des logs API sur Vercel",
      content: "Si vous rencontrez toujours des erreurs API (comme 'is not valid JSON' ou 'Cannot find module'), il est **essentiel** de vérifier les logs de votre fonction `generate-content` sur Vercel après avoir forcé un déploiement avec cache vide. Effectuez une requête, puis examinez les logs du déploiement Vercel pour voir si le message 'API Route /api/generate-content hit!' apparaît. Si l'erreur 'Cannot find module' persiste, assurez-vous d'avoir bien vidé le cache de build sur Vercel lors du redéploiement. Les erreurs de scraping peuvent indiquer des problèmes de réseau ou que l'URL fournie n'est pas accessible au serveur.",
      icon: <AlertTriangle className="text-red-500" size={48} />
    }
  ];

  const currentStep = steps[step];

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-in fade-in zoom-in duration-500 pb-20">
      <div className="p-8 bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl relative">
        <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="absolute -top-10 left-1/2 -translate-x-1/2 p-6 rounded-3xl shadow-xl flex items-center justify-center">
          {currentStep.icon}
        </div>
        <div className="pt-10 space-y-6">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">{currentStep.title}</h2>
          <p className="text-white/70 text-lg leading-relaxed font-serif">{currentStep.content}</p>
        </div>
      </div>

      <div className="flex items-center space-x-8">
        <button 
          disabled={step === 0}
          onClick={() => setStep(s => s - 1)}
          className={`p-4 rounded-full transition-all ${step === 0 ? 'text-white/30' : 'bg-white/10 text-white hover:bg-white/20 active:scale-90'}`}
        >
          <ChevronLeft size={28} />
        </button>

        <div className="flex space-x-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-8 bg-[var(--btn-color)]' : 'w-2 bg-white/10'}`} />
          ))}
        </div>

        <button 
          disabled={step === steps.length - 1}
          onClick={() => setStep(s => s + 1)}
          style={{ backgroundColor: step === steps.length - 1 ? 'rgb(31 41 55)' : 'var(--btn-color)', color: 'var(--btn-text)' }}
          className={`p-4 rounded-full transition-all ${step === steps.length - 1 ? 'opacity-50' : 'shadow-lg shadow-[var(--btn-color)]/30 hover:brightness-110 active:scale-90'}`}
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="flex items-center space-x-2 text-white/50 text-sm italic">
        <Lightbulb size={16} className="text-amber-500" />
        <span>Astuce : Un tutoriel complet est disponible ici pour maîtriser toutes les fonctionnalités.</span>
      </div>
    </div>
  );
};

export default Tutorial;