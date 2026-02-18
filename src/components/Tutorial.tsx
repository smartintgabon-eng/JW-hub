import React from 'react';
import { Lightbulb, Link as LinkIcon, Search, Smartphone, Type, LayoutGrid, ChevronRight } from 'lucide-react';
import { AppSettings, AppView } from '../types'; // Import AppSettings and AppView

interface Props {
  navigateTo: (v: AppView) => void; // navigateTo now expects an AppView
  deferredPrompt: any;
  handleInstallClick: () => void;
  settings: AppSettings; // Pass settings to Tutorial
}

const getLocalizedText = (settings: AppSettings, key: string) => {
  const texts: { [key: string]: { [lang: string]: string } } = {
    'expertGuide': { 'fr': 'Guide Expert', 'en': 'Expert Guide', 'es': 'Guía Experta' },
    'masterAssistant': { 'fr': 'Maîtrisez votre assistant spirituel en 2 minutes.', 'en': 'Master your spiritual assistant in 2 minutes.', 'es': 'Domina tu asistente espiritual en 2 minutos.' },
    'chooseStudy': { 'fr': 'Choisir votre étude', 'en': 'Choose your study', 'es': 'Elige tu estudio' },
    'chooseStudyDesc': { 'fr': 'Sélectionnez \'Cahier\' pour les réunions de semaine ou \'Tour de Garde\' pour le week-end.', 'en': 'Select \'Workbook\' for midweek meetings or \'Watchtower\' for weekend.', 'es': 'Selecciona \'Cuaderno\' para las reuniones de entre semana o \'La Atalaya\' para el fin de semana.' },
    'smartInput': { 'fr': 'Saisie Intelligente', 'en': 'Smart Input', 'es': 'Entrada inteligente' },
    'smartInputDesc': { 'fr': 'Copiez le lien jw.org de l\'article. Pour le Cahier, utilisez le \'+\' pour ajouter les articles de l\'étude de livre.', 'en': 'Copy the jw.org article link. For the Workbook, use \'+\' to add book study articles.', 'es': 'Copia el enlace de jw.org del artículo. Para el Cuaderno, usa el \'+\' para añadir artículos de estudio de libro.' },
    'manualMode': { 'fr': 'Mode Manuel', 'en': 'Manual Mode', 'es': 'Modo manual' },
    'manualModeDesc': { 'fr': 'Si un lien est bloqué, utilisez \'Saisie Manuelle\' pour coller directement le texte de l\'article.', 'en': 'If a link is blocked, use \'Manual Input\' to paste the article text directly.', 'es': 'Si un enlace está bloqueado, usa \'Entrada Manual\' para pegar el texto del artículo directamente.' },
    'expertOptions': { 'fr': 'Options Expert', 'en': 'Expert Options', 'es': 'Opciones expertas' },
    'expertOptionsDesc': { 'fr': 'Générez uniquement ce dont vous avez besoin (Joyaux, Perles, Exposés) ou l\'article complet.', 'en': 'Generate only what you need (Treasures, Gems, Presentations) or the full article.', 'es': 'Genera solo lo que necesites (Joyas, Perlas, Presentaciones) o el artículo completo.' },
    'pwaInstallation': { 'fr': 'Installation PWA', 'en': 'PWA Installation', 'es': 'Instalación PWA' },
    'pwaInstallationDesc': { 'fr': 'Installez l\'app pour l\'utiliser sans internet. Retrouvez vos études dans l\'Historique.', 'en': 'Install the app to use offline. Find your studies in History.', 'es': 'Instala la aplicación para usarla sin conexión a internet. Encuentra tus estudios en el Historial.' },
    'readyToStart': { 'fr': 'Prêt à commencer ?', 'en': 'Ready to start?', 'es': '¿Listo para empezar?' },
    'savedAuto': { 'fr': 'Toutes vos préférences et votre historique sont sauvegardés automatiquement dans le cache de votre appareil.', 'en': 'All your preferences and history are automatically saved in your device\'s cache.', 'es': 'Todas tus preferencias e historial se guardan automáticamente en la caché de tu dispositivo.' },
    'returnHome': { 'fr': 'Retour Accueil', 'en': 'Return Home', 'es': 'Volver al inicio' },
    'installApp': { 'fr': 'Installer l\'App', 'en': 'Install App', 'es': 'Instalar aplicación' },
  };
  return texts[key]?.[settings.language] || texts[key]?.['fr'];
};

const Tutorial: React.FC<Props> = ({ navigateTo, handleInstallClick, settings }) => {
  const steps = [
    {
      title: getLocalizedText(settings, 'chooseStudy'),
      desc: getLocalizedText(settings, 'chooseStudyDesc'),
      icon: <LayoutGrid className="text-blue-400" size={32} />
    },
    {
      title: getLocalizedText(settings, 'smartInput'),
      desc: getLocalizedText(settings, 'smartInputDesc'),
      icon: <LinkIcon className="text-indigo-400" size={32} />
    },
    {
      title: getLocalizedText(settings, 'manualMode'),
      desc: getLocalizedText(settings, 'manualModeDesc'),
      icon: <Type className="text-violet-400" size={32} />
    },
    {
      title: getLocalizedText(settings, 'expertOptions'),
      desc: getLocalizedText(settings, 'expertOptionsDesc'),
      icon: <Search className="text-emerald-400" size={32} />
    },
    {
      title: getLocalizedText(settings, 'pwaInstallation'),
      desc: getLocalizedText(settings, 'pwaInstallationDesc'),
      icon: <Smartphone className="text-amber-400" size={32} />
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
        <h3 className="text-2xl font-black uppercase mb-4">{getLocalizedText(settings, 'readyToStart')}</h3>
        <p className="opacity-80 mb-8 max-w-lg mx-auto">{getLocalizedText(settings, 'savedAuto')}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => navigateTo(AppView.HOME)} className="px-8 py-4 bg-white text-indigo-700 font-black uppercase text-xs tracking-widest rounded-2xl hover:scale-105 transition-all">{getLocalizedText(settings, 'returnHome')}</button>
          <button onClick={handleInstallClick} className="px-8 py-4 bg-black/20 text-white border border-white/20 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-black/30 transition-all">{getLocalizedText(settings, 'installApp')}</button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;