import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Calendar, Settings as SettingsIcon, History as HistoryIcon, 
  HelpCircle, Menu, X, Home as HomeIcon, WifiOff, Download, 
  Lightbulb, BellRing, Loader2, Megaphone, RefreshCw, Search 
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
  const [isExpanded, setIsExpanded] = useState(false); // XGest Style toggle
  const [history, setHistory] = useState<GeneratedStudy[]>(getHistory());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReadingModeActive, setIsReadingModeActive] = useState(false); 
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null); 
  const [newWorkerReady, setNewWorkerReady] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) {
          reg.addEventListener('updatefound', () => {
            const installing = reg.installing;
            if (installing) {
              installing.addEventListener('statechange', () => {
                if (installing.state === 'installed' && navigator.serviceWorker.controller) {
                  setNewWorkerReady(true);
                  setWaitingWorker(installing);
                }
              });
            }
          });
        }
      });
    }

    const bgColor = settings.customHex || settings.backgroundColor || '#09090b';
    const btnColor = settings.customButtonHex || settings.buttonColor || '#4a70b5';
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', getContrastColor(bgColor));
    document.documentElement.style.setProperty('--btn-color', btnColor);
    document.documentElement.style.setProperty('--btn-text', getContrastColor(btnColor));

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [settings]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const handleUpdateClick = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => window.location.reload(), 100); 
    }
  };

  const handleStudyGenerated = (study: GeneratedStudy) => {
    saveToHistory(study);
    setHistory(getHistory());
    setGlobalLoadingMessage(null);
    setView(AppView.HISTORY);
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

      {!isOnline && (
        <div className="fixed top-0 inset-x-0 bg-amber-500 text-black text-[10px] font-bold py-1 text-center z-[100] flex items-center justify-center space-x-2">
          <WifiOff size={12} /> <span>MODE HORS LIGNE</span>
        </div>
      )}

      {/* XGEST SIDEBAR */}
      <aside 
        className={`flex flex-col h-screen bg-black/90 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-50
          ${isExpanded ? 'w-72' : 'w-20'} ${isReadingModeActive ? 'hidden' : 'flex'}`}
      >
        <div className="p-4 flex items-center justify-center mb-8">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-[var(--btn-color)]"
          >
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

        {/* MIDDLE ACTIONS SPACE */}
        <div className="flex-1 flex flex-col justify-center items-center px-4 space-y-4">
          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className={`bg-blue-600/20 border border-blue-600/30 text-blue-400 p-3 rounded-xl hover:bg-blue-600/30 transition-all flex items-center space-x-2
                ${!isExpanded ? 'aspect-square' : 'w-full'}`}
              title="Installer l'App"
            >
              <Download size={20} />
              {isExpanded && <span className="text-[10px] font-bold uppercase">Installer l'App</span>}
            </button>
          )}
          {newWorkerReady && (
            <button 
              onClick={handleUpdateClick}
              className={`bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 p-3 rounded-xl hover:bg-emerald-600/30 transition-all flex items-center space-x-2
                ${!isExpanded ? 'aspect-square' : 'w-full'}`}
              title="Mettre à jour"
            >
              <RefreshCw size={20} />
              {isExpanded && <span className="text-[10px] font-bold uppercase">Mettre à jour</span>}
            </button>
          )}
        </div>

        <div className="p-4 text-center opacity-20">
          <span className="text-xs font-black">JW</span>
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto p-4 md:p-10">
        {view === AppView.HOME && (
          <div className="max-w-4xl mx-auto py-20 text-center animate-in fade-in duration-700">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">Préparez-vous.</h1>
            <p className="text-xl opacity-40 mb-12">L'outil indispensable pour vos réunions et votre prédication.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button onClick={() => setView(AppView.MINISTRY)} className="p-10 bg-white/5 rounded-3xl hover:bg-[var(--btn-color)]/20 border border-white/10 transition-all">
                <Calendar size={48} className="mx-auto mb-4 text-[var(--btn-color)]" />
                <span className="text-xl font-bold uppercase">Cahier de Réunion</span>
              </button>
              <button onClick={() => setView(AppView.WATCHTOWER)} className="p-10 bg-white/5 rounded-3xl hover:bg-[var(--btn-color)]/20 border border-white/10 transition-all">
                <BookOpen size={48} className="mx-auto mb-4 text-[var(--btn-color)]" />
                <span className="text-xl font-bold uppercase">Tour de Garde</span>
              </button>
            </div>
          </div>
        )}
        
        {view === AppView.MINISTRY && <StudyTool type="MINISTRY" onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
        {view === AppView.WATCHTOWER && <StudyTool type="WATCHTOWER" onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
        {view === AppView.PREDICATION && <PredicationTool onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
        {view === AppView.RECHERCHES && <RecherchesTool onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
        {view === AppView.HISTORY && <History history={history} setHistory={setHistory} settings={settings} />}
        {view === AppView.SETTINGS && <Settings setSettings={setAppSettings} settings={settings} />}
        {view === AppView.TUTORIAL && <Tutorial deferredPrompt={deferredPrompt} handleInstallClick={handleInstallClick} navigateTo={setView} />}
        {view === AppView.UPDATES && <Updates />}
      </main>
    </div>
  );
};

export default App;