import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Settings as SettingsIcon, 
  History as HistoryIcon, 
  HelpCircle, 
  Menu,
  X,
  Home as HomeIcon,
  WifiOff,
  Download,
  Lightbulb,
  BellRing,
  Loader2,
  Megaphone, // Icon for Predication
  ChevronLeft, // For sidebar toggle
  ChevronRight, // For sidebar toggle
  RefreshCw // For update button
} from 'lucide-react';
// Fix: Import types from src/types.ts
import { AppView, GeneratedStudy, AppSettings } from './types'; 
import { getSettings, getHistory, saveToHistory } from './utils/storage'; 

// Sub-components
import StudyTool from './components/StudyTool'; 
import History from './components/History'; 
import Settings from './components/Settings'; 
import Tutorial from './components/Tutorial'; 
import Updates from './components/Updates'; 
import PredicationTool from './components/PredicationTool'; // New Predication component

const getContrastColor = (hex: string) => {
  if (!hex || hex.length < 6) return 'white';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16); // Fix: Correctly declare b
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#09090b' : 'white';
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [settings, setAppSettings] = useState<AppSettings>(getSettings());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For mobile overlay sidebar
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => { // For desktop push-content sidebar
    const savedState = localStorage.getItem('isSidebarExpanded');
    if (savedState !== null) {
      return JSON.parse(savedState);
    }
    return window.innerWidth >= 768; // Default to expanded on desktop
  });
  const [history, setHistory] = useState<GeneratedStudy[]>(getHistory());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReadingModeActive, setIsReadingModeActive] = useState(false); 
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null); 
  const [newWorkerReady, setNewWorkerReady] = useState(false); // New state for update prompt
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null); // New state to hold the waiting SW

  useEffect(() => {
    localStorage.setItem('isSidebarExpanded', JSON.stringify(isSidebarExpanded));
  }, [isSidebarExpanded]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

    // --- Service Worker Update Logic ---
    let registration: ServiceWorkerRegistration | undefined;
    const checkServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration?.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // A new worker is installed and waiting
                  setNewWorkerReady(true);
                  setWaitingWorker(installingWorker);
                }
              });
            }
          });
        }
      }
    };
    checkServiceWorker();

    // Listen for the new controller to be active for automatic reload
    const handleControllerChange = () => {
      console.log('New Service Worker is now active. Reloading page...');
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Trigger update check when app gains focus
    const handleFocus = () => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.getRegistration().then(reg => {
          if (reg && reg.waiting) {
            setNewWorkerReady(true);
            setWaitingWorker(reg.waiting);
          }
          reg?.update(); // Trigger an update check
        });
      }
    };
    window.addEventListener('focus', handleFocus);

    // --- END Service Worker Update Logic ---

    const bgColor = settings.customHex || settings.backgroundColor || '#09090b';
    const btnColor = settings.customButtonHex || settings.buttonColor || '#4a70b5';
    const textColor = getContrastColor(bgColor);
    const btnTextColor = getContrastColor(btnColor);

    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--btn-color', btnColor);
    document.documentElement.style.setProperty('--btn-text', btnTextColor);

    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;

    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt); 
      // Clean up SW listeners
      if (registration) {
        registration.removeEventListener('updatefound', () => {}); 
        if (registration.installing) {
          registration.installing.removeEventListener('statechange', () => {});
        }
      }
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [settings, isReadingModeActive]); 

  // Observer le mode lecture de l'historique pour masquer globalement l'UI
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const body = document.body;
          const newReadingModeState = body.classList.contains('reading-mode-active');
          if (newReadingModeState !== isReadingModeActive) {
            setIsReadingModeActive(newReadingModeState);
          }
        }
      });
    });

    observer.observe(document.body, { attributes: true });

    return () => observer.disconnect();
  }, [isReadingModeActive]);


  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  // Handler for update button
  const handleUpdateClick = () => {
    if (waitingWorker) {
      // Send a message to the waiting Service Worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      // The 'controllerchange' listener will handle the reload
      // A small delay to ensure the message is processed before reload
      setTimeout(() => window.location.reload(), 100); 
    }
  };

  const navigateTo = (newView: AppView) => {
    setView(newView);
    setIsSidebarOpen(false); // Close mobile sidebar on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudyGenerated = (study: GeneratedStudy) => {
    saveToHistory(study);
    setHistory(getHistory());
    setGlobalLoadingMessage(null); // Clear loading message
    navigateTo(AppView.HISTORY);
  };

  // NavItem component for sidebar
  const NavItem = ({ icon: Icon, label, active, onClick, isExpanded }: any) => (
    <button
      onClick={onClick}
      style={{ 
        backgroundColor: active ? 'var(--btn-color)' : 'transparent',
        color: active ? 'var(--btn-text)' : 'inherit'
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active ? 'shadow-lg font-bold' : 'opacity-50 hover:opacity-100 hover:bg-white/5'
      } ${!isExpanded ? 'justify-center px-0' : ''}`} // Center icon if collapsed
    >
      <Icon size={20} />
      {isExpanded && <span className="text-sm uppercase tracking-wider">{label}</span>}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-row font-sans"> 
      {/* Global Loading Overlay */}
      {globalLoadingMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-[1000] text-white p-6 text-center animate-in fade-in duration-300">
          <div className="p-8 bg-white/10 border border-white/20 rounded-3xl shadow-2xl flex flex-col items-center space-y-4">
            <Loader2 size={48} className="animate-spin text-[var(--btn-color)]" />
            <p className="text-xl font-bold uppercase tracking-wide">{globalLoadingMessage}</p>
            <p className="text-sm opacity-70 italic">Veuillez ne rien toucher et attendre. Vous serez redirigé automatiquement.</p>
          </div>
        </div>
      )}

      {/* Semi-transparent overlay when sidebar is open on mobile */}
      {isSidebarOpen && !isReadingModeActive && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9998] md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {!isOnline && (
        <div className="fixed top-0 inset-x-0 bg-amber-500 text-black text-[10px] font-bold py-1 text-center z-[100] flex items-center justify-center space-x-2">
          <WifiOff size={12} />
          <span>HORS LIGNE - ACCÈS HISTORIQUE UNIQUEMENT</span>
        </div>
      )}

      {/* Mobile Header (for hamburger menu) */}
      <header className={`md:hidden flex items-center justify-between p-4 border-b border-white/10 sticky top-0 z-50 bg-[var(--bg-color)] ${isReadingModeActive ? 'hidden' : ''}`}>
        <div className="flex items-center space-x-2" onClick={() => navigateTo(AppView.HOME)}>
           <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm">JW</div>
           <span className="font-bold text-lg tracking-tight uppercase">Study</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-lg">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Desktop Sidebar Toggle Button */}
      {!isReadingModeActive && (
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }}
          className={`hidden md:flex items-center justify-center p-2 rounded-full shadow-lg fixed top-6 z-50 transition-all duration-300 ease-in-out hover:brightness-110 active:scale-90 
            ${isSidebarExpanded ? 'left-[calc(18rem+40px)]' : 'left-[calc(5rem+40px)]'} 
          `}
          aria-expanded={isSidebarExpanded}
          aria-controls="main-sidebar"
        >
          {isSidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <aside 
        id="main-sidebar"
        className={`
          p-6 transform transition-transform duration-300 ease-in-out flex-shrink-0 flex-col
          bg-black/90 backdrop-blur-xl border-r border-white/10 
          ${isReadingModeActive ? 'hidden' : ''}
          
          // Mobile specific (overlay)
          ${isSidebarOpen ? 'fixed inset-y-0 left-0 h-screen w-[80vw] max-w-[280px] z-[9999] flex translate-x-0' : 'fixed -translate-x-full w-0 h-screen z-[9999] hidden'} 
          
          // Desktop specific (push content, always visible but collapsed/expanded)
          md:static md:flex md:z-40 
          md:${isSidebarExpanded ? 'w-72 translate-x-0' : 'w-20 translate-x-0 items-center md:py-8'}
        `}
      >
        <div className={`mb-10 px-2 flex items-center ${isSidebarExpanded ? 'space-x-3' : 'justify-center'} cursor-pointer`} onClick={() => navigateTo(AppView.HOME)}>
           <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl shadow-lg">JW</div>
           {isSidebarExpanded && ( // Only show text when expanded
               <div>
                <h1 className="font-black text-xl leading-none uppercase">Study</h1>
                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Assistant</span>
              </div>
           )}
        </div>

        <nav className="space-y-1 flex-1" aria-label="Main navigation">
          <NavItem icon={HomeIcon} label="Accueil" active={view === AppView.HOME} onClick={() => navigateTo(AppView.HOME)} isExpanded={isSidebarExpanded} />
          <NavItem icon={Calendar} label="Cahier" active={view === AppView.MINISTRY} onClick={() => navigateTo(AppView.MINISTRY)} isExpanded={isSidebarExpanded} />
          <NavItem icon={BookOpen} label="Tour de Garde" active={view === AppView.WATCHTOWER} onClick={() => navigateTo(AppView.WATCHTOWER)} isExpanded={isSidebarExpanded} />
          <NavItem icon={Megaphone} label="Prédication" active={view === AppView.PREDICATION} onClick={() => navigateTo(AppView.PREDICATION)} isExpanded={isSidebarExpanded} />
          <NavItem icon={HistoryIcon} label="Historique" active={view === AppView.HISTORY} onClick={() => navigateTo(AppView.HISTORY)} isExpanded={isSidebarExpanded} />
          <NavItem icon={BellRing} label="Mises à jour" active={view === AppView.UPDATES} onClick={() => navigateTo(AppView.UPDATES)} isExpanded={isSidebarExpanded} />
          <NavItem icon={HelpCircle} label="Tutoriel" active={view === AppView.TUTORIAL} onClick={() => navigateTo(AppView.TUTORIAL)} isExpanded={isSidebarExpanded} />
          <NavItem icon={SettingsIcon} label="Paramètres" active={view === AppView.SETTINGS} onClick={() => navigateTo(AppView.SETTINGS)} isExpanded={isSidebarExpanded} />
        </nav>

        {deferredPrompt && (isSidebarExpanded || isSidebarOpen) && ( // Show on desktop expanded or mobile open
          <button 
            onClick={handleInstallClick}
            className="mt-4 w-full bg-blue-600/20 border border-blue-600/30 text-blue-400 py-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-600/30 transition-all"
            aria-label="Installer l'application"
          >
            <Download size={16} />
            <span>Installer l'App</span>
          </button>
        )}

        {newWorkerReady && ( // Show only when an update is ready
          <button
            onClick={handleUpdateClick}
            className="mt-4 w-full bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 py-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest hover:bg-emerald-600/30 transition-all"
            aria-label="Mettre à jour l'application"
          >
            <RefreshCw size={16} />
            <span>Mettre à jour l'App</span>
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
          <div style={{ color: 'var(--text-color)' }}>
            {view === AppView.HOME && (
              <div className="max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 animate-in fade-in duration-700">
                 <div 
                   style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
                   className="w-24 h-24 text-4xl rounded-2xl flex items-center justify-center font-black shadow-2xl hover:scale-105 transition-transform cursor-pointer"
                   onClick={() => navigateTo(AppView.TUTORIAL)}
                   role="button"
                   aria-label="Accéder au tutoriel via le logo"
                 >JW</div>
                 
                 <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase">Préparez-vous. <br/> <span className="opacity-20">Simplement.</span></h1>
                    <p className="text-lg opacity-50 max-w-xl mx-auto font-medium">L'outil indispensable pour approfondir votre étude biblique et vos réunions.</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                    <button onClick={() => navigateTo(AppView.MINISTRY)} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all text-left group">
                      <div className="w-12 h-12 rounded-xl bg-[var(--btn-color)] flex items-center justify-center mb-6 text-[var(--btn-text)] shadow-lg group-hover:scale-110 transition-transform">
                        <Calendar size={24} />
                      </div>
                      <h3 className="font-bold text-2xl mb-2 uppercase tracking-tight">Cahier de Réunion</h3>
                      <p className="text-sm opacity-40 font-medium">Joyaux, perles et étude biblique.</p>
                    </button>

                    <button onClick={() => navigateTo(AppView.WATCHTOWER)} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all text-left group">
                      <div className="w-12 h-12 rounded-xl bg-[var(--btn-color)] flex items-center justify-center mb-6 text-[var(--btn-text)] shadow-lg group-hover:scale-110 transition-transform">
                        <BookOpen size={24} />
                      </div>
                      <h3 className="font-bold text-2xl mb-2 uppercase tracking-tight">Tour de Garde</h3>
                      <p className="text-sm opacity-40 font-medium">Réponses et commentaires paragraphe par paragraphe.</p>
                    </button>
                 </div>
                 
                 <div className="mt-12 text-center max-w-2xl mx-auto space-y-4 pt-12 border-t border-white/5">
                  <Lightbulb size={32} className="mx-auto text-amber-500 mb-4" />
                  <h3 className="text-xl font-bold uppercase tracking-tight">Découvrez toutes les fonctionnalités</h3>
                  <p className="text-sm opacity-60 font-medium">
                    Le tutoriel complet vous guidera à travers chaque aspect de JW Study Pro, des recherches d'articles aux options de personnalisation.
                  </p>
                  <button 
                    onClick={() => navigateTo(AppView.TUTORIAL)}
                    style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
                    className="mt-6 px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest shadow-lg hover:brightness-110 transition-all active:scale-95"
                  >
                    Accéder au Tutoriel
                  </button>
                 </div>
              </div>
            )}

            {view === AppView.MINISTRY && <StudyTool type="MINISTRY" onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
            {view === AppView.WATCHTOWER && <StudyTool type="WATCHTOWER" onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
            {view === AppView.PREDICATION && <PredicationTool onGenerated={handleStudyGenerated} settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />}
            {view === AppView.HISTORY && <History history={history} setHistory={setHistory} settings={settings} />}
            {view === AppView.SETTINGS && <Settings setSettings={setAppSettings} settings={settings} />}
            {view === AppView.TUTORIAL && <Tutorial />}
            {view === AppView.UPDATES && <Updates />}
          </div>
        </main>
      </div>
    );
  };
  
  export default App;