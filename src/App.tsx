import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, Settings as SettingsIcon, History as HistoryIcon, 
  HelpCircle, Menu, X, Home as HomeIcon, WifiOff, Download, 
  Lightbulb, BellRing, Loader2, Megaphone, RefreshCw, Search, ChevronRight 
} from 'lucide-react';
import { AppView, GeneratedStudy, AppSettings } from './types'; 
import { getSettings, getHistory, saveToHistory } from './utils/storage'; 

import StudyTool from './components/StudyTool'; 
import History from './components/History'; 
import Settings from './components/Settings'; 
import Tutorial from './components/Tutorial'; 
import Updates from './components/Updates'; 
import PredicationTool from './components/PredicationTool';
import RecherchesTool from './components/RecherchesTool';

const getContrastColor = (hex: string) => {
  if (!hex || hex.length < 6) return 'white';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16); 
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#09090b' : 'white';
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [settings, setAppSettings] = useState<AppSettings>(getSettings());
  const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 1024); 
  const [history, setHistory] = useState<GeneratedStudy[]>(getHistory());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReadingModeActive, setIsReadingModeActive] = useState(false); 
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null); 

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const bgColor = settings.customHex || settings.backgroundColor || '#09090b';
    const btnColor = settings.customButtonHex || settings.buttonColor || '#4a70b5';
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', getContrastColor(bgColor));
    document.documentElement.style.setProperty('--btn-color', btnColor);
    document.documentElement.style.setProperty('--btn-text', getContrastColor(btnColor));
  }, [settings]);

  const handleStudyGenerated = (study: GeneratedStudy) => {
    saveToHistory(study);
    setHistory(getHistory());
    setGlobalLoadingMessage(null);
    setView(AppView.HISTORY);
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      alert("Installation : Cliquez sur 'Partager' (iOS) ou le Menu (Android) puis 'Ajouter à l'écran d'accueil'.");
    }
  };

  const NavItem = ({ icon: Icon, label, viewId }: any) => (
    <button
      onClick={() => setView(viewId)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 
        ${view === viewId ? 'bg-[var(--btn-color)] text-[var(--btn-text)] shadow-lg' : 'opacity-50 hover:opacity-100 hover:bg-white/5'}
        ${!isExpanded ? 'justify-center' : ''}`}
    >
      <Icon size={24} />
      {isExpanded && <span className="text-sm font-bold uppercase tracking-wider truncate">{label}</span>}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-row bg-[var(--bg-color)] text-[var(--text-color)] overflow-hidden">
      {globalLoadingMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[9999] text-white p-6 text-center">
          <Loader2 size={48} className="animate-spin text-[var(--btn-color)] mb-4" />
          <p className="text-xl font-bold uppercase">{globalLoadingMessage}</p>
        </div>
      )}

      {/* SIDEBAR - md:translate-x-0 ensure it's always visible on tablets+ */}
      <aside 
        className={`flex flex-col h-screen bg-black/90 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-50
          ${isExpanded ? 'w-72' : 'w-20'} ${isReadingModeActive ? 'hidden' : 'flex'} md:static md:translate-x-0`}
      >
        <div className="p-4 flex items-center justify-center mb-8">
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-[var(--btn-color)]">
            <Menu size={24} />
          </button>
        </div>

        <nav className="flex-1 px-2 space-y-2 overflow-y-auto overflow-x-hidden">
          <NavItem icon={HomeIcon} label="Accueil" viewId={AppView.HOME} />
          <NavItem icon={Calendar} label="Cahier" viewId={AppView.MINISTRY} />
          <NavItem icon={BookOpen} label="Tour de Garde" viewId={AppView.WATCHTOWER} />
          <NavItem icon={Megaphone} label="Prédication" viewId={AppView.PREDICATION} />
          <NavItem icon={Search} label="Recherches" viewId={AppView.RECHERCHES} />
          <NavItem icon={HistoryIcon} label="Historique" viewId={AppView.HISTORY} />
          <NavItem icon={BellRing} label="Mises à jour" viewId={AppView.UPDATES} />
          <NavItem icon={HelpCircle} label="Tutoriel" viewId={AppView.TUTORIAL} />
          <NavItem icon={SettingsIcon} label="Paramètres" viewId={AppView.SETTINGS} />
        </nav>

        <div className="p-4 text-center opacity-20"><span className="text-xs font-black tracking-[0.3em]">JW STUDY</span></div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-10 relative">
        {view === AppView.HOME && (
          <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center min-h-[80vh] text-center animate-in fade-in duration-1000">
            {/* JW LOGO Square restoration */}
            <div 
              style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
              className="w-32 h-32 text-5xl rounded-3xl flex items-center justify-center font-black shadow-2xl hover:scale-105 transition-transform cursor-pointer mb-12"
              onClick={() => setView(AppView.TUTORIAL)}
            >JW</div>

            <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter mb-4 leading-none">
              Préparez-vous. <br/> <span className="opacity-20 text-4xl md:text-6xl italic">Simplement.</span>
            </h1>
            
            {/* Brillant Tutorial Button */}
            <button 
              onClick={() => setView(AppView.TUTORIAL)}
              className="group relative px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:shadow-[0_20px_60px_rgba(79,70,229,0.5)] transition-all active:scale-95 mb-16 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Découvrir le tutoriel visuel <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 skew-x-12"></div>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
              <button onClick={() => setView(AppView.MINISTRY)} className="p-10 bg-white/5 rounded-[2.5rem] hover:bg-white/10 border border-white/10 transition-all text-left group">
                <Calendar size={48} className="mb-6 text-[var(--btn-color)]" />
                <h3 className="text-2xl font-bold uppercase mb-2">Cahier</h3>
                <p className="text-sm opacity-40 italic">Réunions de semaine</p>
              </button>
              <button onClick={() => setView(AppView.WATCHTOWER)} className="p-10 bg-white/5 rounded-[2.5rem] hover:bg-white/10 border border-white/10 transition-all text-left group">
                <BookOpen size={48} className="mb-6 text-[var(--btn-color)]" />
                <h3 className="text-2xl font-bold uppercase mb-2">Tour de Garde</h3>
                <p className="text-sm opacity-40 italic">Étude de week-end</p>
              </button>
            </div>
          </div>
        )}
        
        {view === AppView.MINISTRY && <StudyTool type="MINISTRY" onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
        {view === AppView.WATCHTOWER && <StudyTool type="WATCHTOWER" onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
        {view === AppView.PREDICATION && <PredicationTool onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
        {view === AppView.RECHERCHES && <RecherchesTool onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
        {view === AppView.HISTORY && <History history={history} setHistory={setHistory} settings={settings} />}
        {view === AppView.SETTINGS && <Settings setSettings={setAppSettings} settings={settings} deferredPrompt={deferredPrompt} handleInstallClick={handleInstallClick} />}
        {view === AppView.TUTORIAL && <Tutorial deferredPrompt={deferredPrompt} handleInstallClick={handleInstallClick} navigateTo={setView} />}
        {view === AppView.UPDATES && <Updates />}
      </main>
    </div>
  );
};

export default App;