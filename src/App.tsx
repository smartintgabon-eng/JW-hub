import React, { useState, useEffect } from 'react';
import { AppSettings, AppView, GeneratedStudy } from './types';
import { Settings as SettingsIcon, Mic, Search, BookOpen, Home as HomeIcon, Bell, Menu, Clock } from 'lucide-react';
import { getContrastTextColor } from './utils/colorUtils';

// Import des composants
import StudyTool from './components/StudyTool';
import PredicationTool from './components/PredicationTool';
import Discourse from './components/Discourse';
import RecherchesTool from './components/RecherchesTool';
import History from './components/History';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';
import Updates from './components/Updates';
import PreferenceManager from './components/PreferenceManager';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [history, setHistory] = useState<GeneratedStudy[]>([]);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('jw_settings');
    return saved ? JSON.parse(saved) : {
      btnColor: '#4a70b5',
      bgColor: '#09090b',
      autoSave: true,
      answerPreferences: [],
      language: 'fr'
    };
  });

  // Gestion de l'installation PWA
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--btn-color', settings.btnColor);
    const textColor = getContrastTextColor(settings.btnColor);
    document.documentElement.style.setProperty('--btn-text', textColor === 'black' ? '#000000' : '#ffffff');
    localStorage.setItem('jw_settings', JSON.stringify(settings));
  }, [settings]);

  const renderContent = () => {
    const commonProps = { settings, setGlobalLoadingMessage, onGenerated: () => setCurrentView(AppView.HISTORY) };
    
    switch (currentView) {
      case AppView.WATCHTOWER: return <StudyTool category="tour_de_garde" title="TOUR DE GARDE" icon={<BookOpen size={28} />} placeholderLink="https://www.jw.org/fr/..." showParts={false} showPredicationTypes={false} onGenerationComplete={() => setCurrentView(AppView.HISTORY)} {...commonProps} />;
      case AppView.MINISTRY: return <StudyTool category="cahier_vie_et_ministere" title="CAHIER DE RÉUNION" icon={<Clock size={28} />} placeholderLink="https://www.jw.org/fr/..." showParts={true} showPredicationTypes={false} onGenerationComplete={() => setCurrentView(AppView.HISTORY)} {...commonProps} />;
      case AppView.PREDICATION: return <PredicationTool {...commonProps} />;
      case AppView.RECHERCHES: return <RecherchesTool {...commonProps} />;
      case AppView.DISCOURS: return <Discourse {...commonProps} />;
      case AppView.HISTORY: return <History history={history} setHistory={setHistory} settings={settings} />;
      case AppView.SETTINGS: return <Settings settings={settings} setSettings={setSettings} deferredPrompt={deferredPrompt} handleInstallClick={handleInstallClick} setView={setCurrentView} />;
      case AppView.PREFERENCE_MANAGER: return <PreferenceManager settings={settings} setSettings={setSettings} />;
      case AppView.TUTORIAL: return <Tutorial />;
      case AppView.UPDATES: return <Updates settings={settings} />;
      default: return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-500">
          <MenuCard icon={<BookOpen />} label="Tour de Garde" desc="Étude profonde" onClick={() => setCurrentView(AppView.WATCHTOWER)} />
          <MenuCard icon={<Clock />} label="Cahier" desc="Réunion semaine" onClick={() => setCurrentView(AppView.MINISTRY)} />
          <MenuCard icon={<HomeIcon />} label="Prédication" desc="Préparations" onClick={() => setCurrentView(AppView.PREDICATION)} />
          <MenuCard icon={<Mic />} label="Discours" desc="4 modes expert" onClick={() => setCurrentView(AppView.DISCOURS)} />
          <MenuCard icon={<Search />} label="Recherches" desc="IA & Grounding" onClick={() => setCurrentView(AppView.RECHERCHES)} />
          <MenuCard icon={<SettingsIcon />} label="Paramètres" desc="Style & PWA" onClick={() => setCurrentView(AppView.SETTINGS)} />
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-white/20" style={{ backgroundColor: settings.bgColor }}>
      {/* Barre de navigation simplifiée façon verre */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <h1 onClick={() => setCurrentView(AppView.HOME)} className="text-xl font-black uppercase tracking-tighter cursor-pointer">JW HUB <span style={{ color: settings.btnColor }}>PRO</span></h1>
        <div className="flex items-center gap-4">
          <button onClick={() => setCurrentView(AppView.HISTORY)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Clock size={20}/></button>
          <button onClick={() => setCurrentView(AppView.UPDATES)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><Bell size={20}/></button>
          <button className="p-2 bg-white/5 rounded-full"><Menu size={20}/></button>
        </div>
      </nav>

      <main className="pt-28 pb-10 px-6 max-w-6xl mx-auto">
        {renderContent()}
      </main>

      {/* Chargement global */}
      {globalLoadingMessage && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-[var(--btn-color)] border-white/10 rounded-full animate-spin mb-4"></div>
          <p className="font-black uppercase tracking-widest text-sm animate-pulse">{globalLoadingMessage}</p>
        </div>
      )}
    </div>
  );
};

const MenuCard = ({ icon, label, desc, onClick }: any) => (
  <button onClick={onClick} className="group relative p-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-left hover:bg-white/10 transition-all active:scale-95 overflow-hidden">
    <div className="mb-4 p-3 bg-[var(--btn-color)]/10 rounded-2xl w-fit text-[var(--btn-color)]">{React.cloneElement(icon, { size: 28 })}</div>
    <h3 className="text-lg font-black uppercase leading-tight">{label}</h3>
    <p className="text-[10px] opacity-40 uppercase font-bold tracking-wider mt-1">{desc}</p>
  </button>
);

export default App;
