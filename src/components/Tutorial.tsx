import React from 'react';
import { Home, Calendar, BookOpen, Megaphone, Search, History as HistoryIcon, BellRing, HelpCircle, Settings as SettingsIcon, Mic, Lightbulb } from 'lucide-react';
import { AppSettings, AppView } from '../types.ts'; // Import AppSettings and AppView

interface Props {
  navigateTo: (v: AppView) => void;
  deferredPrompt: any;
  handleInstallClick: () => void;
  settings: AppSettings;
}

const getLocalizedText = (settings: AppSettings, key: string) => {
  const texts: { [key: string]: { [lang: string]: string } } = {
    'expertGuide': { 'fr': 'Guide des Icônes & Tutoriel', 'en': 'Icons Guide & Tutorial', 'es': 'Guía de Iconos y Tutorial' },
    'masterAssistant': { 'fr': 'Découvrez à quoi correspond chaque icône du menu.', 'en': 'Discover what each menu icon means.', 'es': 'Descubre qué significa cada icono del menú.' },
    'home': { 'fr': 'Accueil', 'en': 'Home', 'es': 'Inicio' },
    'workbook': { 'fr': 'Cahier Vie & Ministère', 'en': 'Life & Ministry Workbook', 'es': 'Guía de Actividades' },
    'watchtower': { 'fr': 'Tour de Garde', 'en': 'Watchtower', 'es': 'La Atalaya' },
    'preaching': { 'fr': 'Prédication', 'en': 'Preaching', 'es': 'Predicación' },
    'discours': { 'fr': 'Discours', 'en': 'Public Talk', 'es': 'Discurso' },
    'searches': { 'fr': 'Recherches', 'en': 'Searches', 'es': 'Búsquedas' },
    'history': { 'fr': 'Historique', 'en': 'History', 'es': 'Historial' },
    'updates': { 'fr': 'Mises à jour', 'en': 'Updates', 'es': 'Actualizaciones' },
    'tutorial': { 'fr': 'Tutoriel', 'en': 'Tutorial', 'es': 'Tutorial' },
    'settings': { 'fr': 'Paramètres', 'en': 'Settings', 'es': 'Ajustes' },
    'readyToStart': { 'fr': 'Prêt à commencer ?', 'en': 'Ready to start?', 'es': '¿Listo para empezar?' },
    'savedAuto': { 'fr': 'Toutes vos préférences et votre historique sont sauvegardés automatiquement dans le cache de votre appareil.', 'en': 'All your preferences and history are automatically saved in your device\'s cache.', 'es': 'Todas tus preferencias e historial se guardan automáticamente en la caché de tu dispositivo.' },
    'returnHome': { 'fr': 'Retour Accueil', 'en': 'Return Home', 'es': 'Volver al inicio' },
    'installApp': { 'fr': 'Installer l\'App', 'en': 'Install App', 'es': 'Instalar aplicación' },
  };
  return texts[key]?.[settings.language] || texts[key]?.['fr'];
};

const Tutorial: React.FC<Props> = ({ navigateTo, handleInstallClick, settings }) => {
  const tutorialData = [
    {
      id: 'home',
      title: getLocalizedText(settings, 'home'),
      desc: "Représenté par l'icône de maison. C'est votre tableau de bord principal.",
      details: "L'accueil vous permet de revenir à tout moment au point de départ, d'installer l'application (PWA) et d'avoir un accès rapide au tutoriel.",
      icon: <Home className="text-blue-400" size={32} />
    },
    {
      id: 'workbook',
      title: getLocalizedText(settings, 'workbook'),
      desc: "L'icône Calendrier. Préparez vos réunions de semaine (Joyaux, Perles, etc.).",
      details: "Copiez le lien jw.org du programme de la semaine. Vous pouvez ajouter d'autres liens avec le bouton '+' pour l'étude biblique de l'assemblée.",
      result: "Résultat : Des réponses structurées pour les Joyaux, les Perles et les présentations.",
      icon: <Calendar className="text-emerald-400" size={32} />
    },
    {
      id: 'watchtower',
      title: getLocalizedText(settings, 'watchtower'),
      desc: "L'icône de Livre ouvert. Pour préparer l'étude de la Tour de Garde du week-end.",
      details: "Collez le lien direct de l'article de la Tour de Garde. L'IA lira l'article et préparera des réponses pour chaque question.",
      result: "Résultat : Les questions, les paragraphes résumés et des commentaires prêts à donner, incluant les versets.",
      icon: <BookOpen className="text-indigo-400" size={32} />
    },
    {
      id: 'preaching',
      title: getLocalizedText(settings, 'preaching'),
      desc: "Le Mégaphone. Des préparations sur mesure pour le ministère.",
      details: "Choisissez le type de témoignage (porte-à-porte, nouvelle visite, cours biblique) et l'IA vous aide à structurer une présentation adaptée.",
      result: "Résultat : Un plan de conversation naturel avec introduction, verset, et question en suspens.",
      icon: <Megaphone className="text-violet-400" size={32} />
    },
    {
      id: 'discours',
      title: getLocalizedText(settings, 'discours'),
      desc: "Le Micro. Générez des plans de discours complets.",
      details: "Saisissez un thème ou un verset. L'IA structure un discours avec introduction, points principaux, conclusion et suggestions de cantiques.",
      result: "Résultat : Un plan détaillé avec des versets d'appui et des illustrations.",
      icon: <Mic className="text-orange-400" size={32} />
    },
    {
      id: 'search',
      title: getLocalizedText(settings, 'searches'),
      desc: "La Loupe. Recherche hybride intelligente sur jw.org et WOL.",
      details: "Posez des questions bibliques. L'IA cherche les sources officielles, vous donne un aperçu, puis analyse le tout pour vous donner une réponse.",
      result: "Résultat : Une réponse détaillée, sourcée, avec les liens directs vers les articles utilisés.",
      icon: <Search className="text-pink-400" size={32} />
    },
    {
      id: 'history',
      title: getLocalizedText(settings, 'history'),
      desc: "L'Horloge. Retrouvez toutes vos préparations passées.",
      details: "Toutes vos études sont sauvegardées localement. Vous pouvez les rouvrir, les exporter ou les supprimer à tout moment.",
      icon: <HistoryIcon className="text-amber-400" size={32} />
    },
    {
      id: 'updates',
      title: getLocalizedText(settings, 'updates'),
      desc: "La Cloche. Restez informé des dernières nouveautés.",
      details: "Consultez cet onglet pour découvrir les nouvelles fonctionnalités ajoutées à l'application et les corrections de bugs.",
      icon: <BellRing className="text-cyan-400" size={32} />
    },
    {
      id: 'tutorial',
      title: getLocalizedText(settings, 'tutorial'),
      desc: "Le Point d'Interrogation. C'est la page sur laquelle vous êtes !",
      details: "Ce guide vous aide à comprendre comment utiliser chaque outil de l'application.",
      icon: <HelpCircle className="text-teal-400" size={32} />
    },
    {
      id: 'settings',
      title: getLocalizedText(settings, 'settings'),
      desc: "La Roue Crantée. Personnalisez votre expérience.",
      details: "Changez la langue, choisissez vos couleurs préférées, modifiez le comportement de l'IA (taille des réponses) et gérez vos données.",
      icon: <SettingsIcon className="text-red-400" size={32} />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700 pb-24">
      <header className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-600/20 text-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <Lightbulb size={40} />
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">{getLocalizedText(settings, 'expertGuide')}</h2>
        <p className="opacity-40 italic">{getLocalizedText(settings, 'masterAssistant')}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tutorialData.map((s, i) => (
          <div key={i} className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 flex flex-col gap-6 items-start hover:bg-white/10 transition-all group">
            <div className="flex items-center gap-4 w-full">
              <div className="p-4 bg-white/5 rounded-2xl transition-transform group-hover:scale-110">{s.icon}</div>
              <h3 className="font-black uppercase text-sm tracking-widest flex-1">{s.title}</h3>
            </div>
            <p className="text-sm font-bold opacity-80 leading-relaxed w-full">{s.desc}</p>
            <div className="text-sm opacity-60 leading-relaxed w-full bg-black/20 p-4 rounded-xl">
              <span className="block mb-2 font-semibold">Comment ça marche :</span>
              {s.details}
              {s.result && (
                <span className="block mt-3 text-emerald-400/80 font-medium">
                  {s.result}
                </span>
              )}
            </div>
          </div>
        ))} 
      </div>

      <div className="p-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] text-center text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <h3 className="text-2xl font-black uppercase mb-4">{getLocalizedText(settings, 'readyToStart')}</h3>
        <p className="opacity-80 mb-8 max-w-lg mx-auto">{getLocalizedText(settings, 'savedAuto')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigateTo(AppView.HOME)} className="px-8 py-4 bg-white text-indigo-700 font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all">{getLocalizedText(settings, 'returnHome')}</button>
          <button onClick={handleInstallClick} className="px-8 py-4 bg-[var(--btn-color)] text-[var(--btn-text)] font-black uppercase text-xs tracking-widest rounded-2xl hover:opacity-90 transition-opacity shadow-lg">{getLocalizedText(settings, 'installApp')}</button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;