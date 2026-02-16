import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, ChevronRight, ChevronLeft, Lightbulb, Link as LinkIcon, Search, Save, Calendar, BookOpen, Settings as SettingsIcon, History as HistoryIcon, Download, BellRing, Megaphone, Server, AlertTriangle, Plus, Minus, Menu, Maximize2, X
} from 'lucide-react';
import { AppView } from '../types';

interface TutorialProps {
  deferredPrompt: any;
  handleInstallClick: () => void;
  navigateTo: (view: AppView) => void;
}

const Tutorial: React.FC<TutorialProps> = ({ deferredPrompt, handleInstallClick, navigateTo }) => {
  const [step, setStep] = useState(0);
  const [tourActive, setTourActive] = useState(false);
  const [pwaHelpVisible, setPwaHelpVisible] = useState(false);
  const [demoUrls, setDemoUrls] = useState<string[]>(['']);
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    // Reset demo URLs if tutorial is exited/re-entered
    setDemoUrls(['']);
    setTourActive(false);
    setPwaHelpVisible(false);
  }, []);

  const addDemoUrl = () => {
    if (demoUrls.length < 3) setDemoUrls([...demoUrls, '']); // Limit demo to 3 for simplicity
  };

  const removeDemoUrl = (index: number) => {
    if (demoUrls.length > 1) {
      setDemoUrls(demoUrls.filter((_, i) => i !== index));
    }
  };

  const demoLinks = [
    { target: 'multi-link-input', content: "Ici, collez jusqu'à 8 liens d'articles JW.ORG (1 par ligne). L'IA les analysera tous !", icon: <LinkIcon size={24} /> },
    { target: 'add-link-button', content: "Cliquez sur '+' pour ajouter plus de champs de liens.", icon: <Plus size={24} /> },
    { target: 'generate-button', content: "Lancez la recherche pour que l'IA analyse les liens et génère les réponses.", icon: <Search size={24} /> },
    { target: 'sidebar-menu', content: "Le menu latéral vous permet de naviguer entre les sections principales de l'application.", icon: <Menu size={24} /> },
    { target: 'reading-mode-toggle', content: "Une fois l'étude générée, activez le mode lecture pour une expérience immersive et sans distraction.", icon: <Maximize2 size={24} /> },
  ];

  const pwaInstallationSteps = {
    android: [
      { text: "1. Ouvrez JW Study dans Chrome.", media: "android_step1.gif" },
      { text: "2. Appuyez sur le menu (trois points en haut à droite).", media: "android_step2.gif" },
      { text: "3. Sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.", media: "android_step3.gif" },
      { text: "4. Confirmez l'installation.", media: "android_step4.gif" },
    ],
    ios: [
      { text: "1. Ouvrez JW Study dans Safari.", media: "ios_step1.gif" },
      { text: "2. Appuyez sur le bouton 'Partager' (icône carré avec une flèche vers le haut) en bas de l'écran.", media: "ios_step2.gif" },
      { text: "3. Faites défiler vers le bas et sélectionnez 'Sur l'écran d'accueil'.", media: "ios_step3.gif" },
      { text: "4. Appuyez sur 'Ajouter' en haut à droite.", media: "ios_step4.gif" },
    ],
    default: [
      { text: "Utilisez le menu de votre navigateur (souvent trois points ou une flèche) et cherchez une option comme 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.", media: null },
    ]
  };

  const getOs = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/android/i.test(userAgent)) return 'android';
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return 'ios';
    return 'default';
  };

  const currentPwaSteps = pwaInstallationSteps[getOs()];

  const TutorialStepContent = ({ currentStepData, isGuidedTour = false }: any) => (
    <div className={`p-8 bg-white/5 border border-white/10 rounded-[2rem] shadow-2xl relative ${isGuidedTour ? 'min-h-[200px] flex flex-col justify-center items-center' : ''}`}>
      <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="absolute -top-10 left-1/2 -translate-x-1/2 p-6 rounded-3xl shadow-xl flex items-center justify-center">
        {currentStepData.icon}
      </div>
      <div className="pt-10 space-y-6">
        <h2 className="text-3xl font-black text-white uppercase tracking-tight">{currentStepData.title}</h2>
        <p className="text-white/70 text-lg leading-relaxed font-serif">{currentStepData.content}</p>
        
        {/* Render interactive demos or specific content based on step */}
        {currentStepData.democode === 'multi-link-demo' && (
          <div className="space-y-4 pt-4">
            <label className="text-[10px] font-black uppercase opacity-40 ml-1 tracking-[0.2em]">Liens des articles (démo)</label>
            {demoUrls.map((url, index) => (
              <div key={index} className="flex items-center space-x-2 link-group"> {/* Added link-group class for consistent styling */}
                <textarea
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-4 pr-10 focus:border-[var(--btn-color)] outline-none text-base resize-none"
                  rows={1}
                  placeholder="https://www.jw.org/..."
                  value={url}
                  readOnly
                />
                <button 
                  onClick={addDemoUrl} 
                  className={`w-8 h-8 flex items-center justify-center rounded-full bg-emerald-600 text-white shadow-md btn-action btn-plus ${index === demoUrls.length - 1 && demoUrls.length < 3 ? 'animate-bounce' : ''}`}
                  title="Ajouter un lien (démo)"
                  disabled={demoUrls.length >= 3}
                >
                  <Plus size={16} />
                </button>
                {demoUrls.length > 1 && (
                  <button 
                    onClick={() => removeDemoUrl(index)} 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 text-white shadow-md btn-action btn-moins"
                    title="Supprimer ce lien (démo)"
                  >
                    <Minus size={16} />
                  </button>
                )}
              </div>
            ))}
             <p className="text-[10px] opacity-30 text-center font-bold italic mt-2">Cliquez sur le '+' pour ajouter des liens démo.</p>
          </div>
        )}
        {currentStepData.democode === 'generate-demo' && (
           <button 
             style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
             className="w-full py-4 rounded-xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center space-x-2 animate-pulse"
           >
             <Search size={18} />
             <span>Générer les réponses (Démo)</span>
           </button>
        )}
        {currentStepData.democode === 'pwa-install-help' && (
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="text-xl font-bold uppercase tracking-tight">Installation PWA sur {getOs() === 'android' ? 'Android' : getOs() === 'ios' ? 'iOS' : 'votre appareil'} :</h3>
            {currentPwaSteps.map((step, idx) => (
              <div key={idx} className="flex items-start space-x-3 bg-white/5 p-4 rounded-xl">
                <span className="font-bold text-[var(--btn-color)]">{idx + 1}.</span>
                <p className="text-sm text-left">{step.text}</p>
                {step.media && (
                  <div className="text-xs opacity-50 italic">[Placeholder pour {step.media}]</div>
                )}
              </div>
            ))}
            <button 
              onClick={handleInstallClick} 
              disabled={!deferredPrompt}
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
              className="mt-6 px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center mx-auto space-x-2"
            >
              <Download size={20} />
              <span>Installer l'App maintenant</span>
            </button>
            {!deferredPrompt && <p className="text-[10px] opacity-40 italic mt-2">Le bouton peut ne pas être disponible si l'application est déjà installée ou si votre navigateur ne supporte pas l'installation PWA directe.</p>}
          </div>
        )}
      </div>
    </div>
  );

  const tutorialSteps = [
    {
      title: "Introduction Rapide",
      content: "Découvrez les fonctionnalités clés de JW Study Pro à travers cette visite guidée interactive.",
      icon: <HelpCircle size={48} />
    },
    {
      title: "Saisie Multi-Liens Intelligente",
      content: "Collez plusieurs liens d'articles jw.org (un par ligne) dans cette zone. Notre IA les combinera pour une analyse complète.",
      icon: <LinkIcon size={48} />,
      democode: 'multi-link-demo'
    },
    {
      title: "Lancez l'Analyse Hybride",
      content: "Après avoir ajouté vos liens, cliquez sur le bouton 'Générer' pour lancer notre 'Hybrid Intelligence' qui scrape le contenu et utilise Google Search si besoin.",
      icon: <Search size={48} />,
      democode: 'generate-demo'
    },
    {
      title: "Navigation Facile",
      content: "Utilisez le menu latéral pour accéder rapidement aux différentes sections : Cahier, Tour de Garde, Historique, Paramètres, etc.",
      icon: <Menu size={48} />
    },
    {
      title: "Mode Lecture Immersif",
      content: "Une fois votre étude générée, activez le mode lecture pour une concentration maximale, sans aucune distraction visuelle.",
      icon: <Maximize2 size={48} />
    },
    {
      title: "Historique et Export",
      content: "Toutes vos études sont sauvegardées et accessibles hors ligne dans l'Historique. Vous pouvez les régénérer ou les exporter en PDF/DOCX.",
      icon: <HistoryIcon size={48} />
    },
    {
      title: "Installer l'Application (PWA)",
      content: "Profitez d'une expérience complète et hors ligne en installant JW Study Pro sur votre appareil comme une véritable application.",
      icon: <Download size={48} />,
      democode: 'pwa-install-help'
    },
  ];

  const currentTutorialStep = tutorialSteps[step];

  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-10 animate-in fade-in zoom-in duration-500 pb-20">
      
      {/* Dynamic Content based on isMobile */}
      {isMobile ? (
        // Mobile "Story" format
        <div className="w-full flex flex-col items-center">
          <TutorialStepContent currentStepData={currentTutorialStep} />
          <div className="flex items-center space-x-4 mt-8">
            <button 
              disabled={step === 0}
              onClick={() => setStep(s => s - 1)}
              className={`p-3 rounded-full transition-all ${step === 0 ? 'text-white/30' : 'bg-white/10 text-white hover:bg-white/20 active:scale-90'}`}
              aria-label="Étape précédente"
            >
              <ChevronLeft size={24} />
            </button>
            <span className="text-sm opacity-60">{step + 1} / {tutorialSteps.length}</span>
            <button 
              disabled={step === tutorialSteps.length - 1}
              onClick={() => setStep(s => s + 1)}
              style={{ backgroundColor: step === tutorialSteps.length - 1 ? 'rgb(31 41 55)' : 'var(--btn-color)', color: 'var(--btn-text)' }}
              className={`p-3 rounded-full transition-all ${step === tutorialSteps.length - 1 ? 'opacity-50' : 'shadow-lg shadow-[var(--btn-color)]/30 hover:brightness-110 active:scale-90'}`}
              aria-label="Étape suivante"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      ) : (
        // Desktop format (all content visible, no "story" navigation)
        <div className="w-full space-y-12">
          {tutorialSteps.map((stepData, index) => (
            <TutorialStepContent key={index} currentStepData={{ ...stepData, icon: tutorialSteps[index].icon }} />
          ))}
        </div>
      )}

      {/* Button to start guided tour on desktop, or specific action on mobile */}
      {!isMobile && (
        <button 
          onClick={() => setTourActive(true)} // Example: Toggle a full app tour on desktop
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
          className="mt-12 px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
          <Lightbulb size={20} />
          <span>Lancer la Visite Guidée (Démo)</span>
        </button>
      )}

      {/* Placeholder for the actual guided tour overlay if implemented app-wide */}
      {tourActive && !isMobile && (
        <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center text-white">
          <div className="bg-white/10 p-8 rounded-2xl flex flex-col items-center space-y-4">
            <Lightbulb size={48} className="text-yellow-400" />
            <p className="text-xl font-bold">Visite guidée en cours (démo)</p>
            <p>Imaginez des bulles d'aide pointant vers les vrais éléments de l'interface !</p>
            <button 
              onClick={() => setTourActive(false)} 
              className="mt-4 px-6 py-2 bg-blue-600 rounded-lg"
            >
              Fermer la démo
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 text-white/50 text-sm italic mt-12">
        <Lightbulb size={16} className="text-amber-500" />
        <span>Astuce : Un tutoriel complet est disponible ici pour maîtriser toutes les fonctionnalités.</span>
      </div>
    </div>
  );
};

export default Tutorial;