
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
  Download
} from 'lucide-react';
import { AppView, GeneratedStudy, AppSettings } from './types'; 
import { getSettings, getHistory, saveToHistory } from './utils/storage'; 

// Sub-components
import StudyTool from './components/StudyTool'; 
import History from './components/History'; 
import Settings from './components/Settings'; 
import Tutorial from './components/Tutorial'; 

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<GeneratedStudy[]>(getHistory());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isReadingModeActive, setIsReadingModeActive] = useState(false); // État pour le mode lecture global

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);

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
    };
  }, [settings]);

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

  const navigateTo = (newView: AppView) => {
    setView(newView);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStudyGenerated = (study: GeneratedStudy) => {
    saveToHistory(study);
    setHistory(getHistory());
    navigateTo(AppView.HISTORY);
  };

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      style={{ 
        backgroundColor: active ? 'var(--btn-color)' : 'transparent',
        color: active ? 'var(--btn-text)' : 'inherit'
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active ? 'shadow-lg font-bold' : 'opacity-50 hover:opacity-100 hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span className="text-sm uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 bg-amber-500 text-black text-[10px] font-bold py-1 text-center z-[100] flex items-center justify-center space-x-2">
          <WifiOff size={12} />
          <span>HORS LIGNE - ACCÈS HISTORIQUE UNIQUEMENT</span>
        </div>
      )}

      {/* Mobile Header */}
      <header className={`md:hidden flex items-center justify-between p-4 border-b border-white/10 sticky top-0 z-50 bg-[var(--bg-color)] ${isReadingModeActive ? 'hidden' : ''}`}>
        <div className="flex items-center space-x-2" onClick={() => navigateTo(AppView.HOME)}>
           <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm">JW</div>
           <span className="font-bold text-lg tracking-tight uppercase">Study</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-white/5 rounded-lg">
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-black/40 backdrop-blur-xl border-r border-white/10 p-6 transform transition-transform duration-300 md:translate-x-0 md:static flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${isReadingModeActive ? 'hidden' : ''}
      `}>
        <div className="mb-10 px-2 flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo(AppView.HOME)}>
           <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-12 h-12 flex items-center justify-center rounded-xl font-black text-xl shadow-lg">JW</div>
           <div>
            <h1 className="font-black text-xl leading-none uppercase">Study</h1>
            <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Assistant</span>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          <NavItem icon={HomeIcon} label="Accueil" active={view === AppView.HOME} onClick={() => navigateTo(AppView.HOME)} />
          <NavItem icon={Calendar} label="Cahier" active={view === AppView.MINISTRY} onClick={() => navigateTo(AppView.MINISTRY)} />
          <NavItem icon={BookOpen} label="Tour de Garde" active={view === AppView.WATCHTOWER} onClick={() => navigateTo(AppView.WATCHTOWER)} />
          <NavItem icon={HistoryIcon} label="Historique" active={view === AppView.HISTORY} onClick={() => navigateTo(AppView.HISTORY)} />
          <NavItem icon={HelpCircle} label="Tutoriel" active={view === AppView.TUTORIAL} onClick={() => navigateTo(AppView.TUTORIAL)} />
          <NavItem icon={SettingsIcon} label="Paramètres" active={view === AppView.SETTINGS} onClick={() => navigateTo(AppView.SETTINGS)} />
        </nav>

        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="mt-4 w-full bg-blue-600/20 border border-blue-600/30 text-blue-400 py-3 rounded-xl flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-600/30 transition-all"
          >
            <Download size={16} />
            <span>Installer l'App</span>
          </button>
        )}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {view === AppView.HOME && (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-12 animate-in fade-in duration-700">
               <div 
                 style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} 
                 className="w-24 h-24 text-4xl rounded-2xl flex items-center justify-center font-black shadow-2xl hover:scale-105 transition-transform cursor-pointer"
                 onClick={() => navigateTo(AppView.TUTORIAL)}
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
            </div>
          )}

          <div style={{ color: 'var(--text-color)' }}>
            {view === AppView.MINISTRY && <StudyTool type="MINISTRY" onGenerated={handleStudyGenerated} settings={settings} />}
            {view === AppView.WATCHTOWER && <StudyTool type="WATCHTOWER" onGenerated={handleStudyGenerated} settings={settings} />}
            {view === AppView.HISTORY && <History history={history} setHistory={setHistory} settings={settings} />}
            {view === AppView.SETTINGS && <Settings setSettings={setAppSettings} settings={settings} />}
            {view === AppView.TUTORIAL && <Tutorial />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;