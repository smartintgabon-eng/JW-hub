
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Settings as SettingsIcon, 
  History as HistoryIcon, 
  HelpCircle, 
  ChevronLeft,
  Menu,
  X,
  Home as HomeIcon,
  ShieldCheck,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { AppView, GeneratedStudy, AppSettings, StudyPart } from './types';
import { getSettings, getHistory, saveToHistory, deleteFromHistory, saveSettings } from './utils/storage';

// Sub-components
import StudyTool from './components/StudyTool';
import History from './components/History';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';

const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = size === "lg" ? "w-20 h-20" : size === "md" ? "w-12 h-12" : "w-10 h-10";
  const iconSize = size === "lg" ? 48 : size === "md" ? 28 : 22;
  return (
    <div className={`${dimensions} bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-600/20 text-white transition-transform active:scale-95 cursor-pointer`}>
      <BookOpen size={iconSize} strokeWidth={2.5} />
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [settings, setAppSettings] = useState<AppSettings>(getSettings());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<GeneratedStudy[]>(getHistory());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const initSettings = getSettings();
      setAppSettings(initSettings);
      const bodyBg = initSettings?.customHex || initSettings?.backgroundColor || '#09090b';
      document.body.style.backgroundColor = bodyBg;
      setIsInitialized(true);
    } catch (e) {
      console.error("Initialisation error", e);
      setIsInitialized(true); // Proceed anyway to avoid total black screen
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      const bodyBg = settings?.customHex || settings?.backgroundColor || '#09090b';
      document.body.style.backgroundColor = bodyBg;
    }
  }, [settings, isInitialized]);

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

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Chargement...</span>
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
          : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <span className="font-bold tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-700 font-sans selection:bg-blue-500/30">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center space-x-3" onClick={() => navigateTo(AppView.HOME)}>
          <Logo size="sm" />
          <span className="font-black text-xl tracking-tighter text-white">JW Study</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 bg-zinc-800/50 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950/80 backdrop-blur-3xl border-r border-zinc-800 p-6 transform transition-transform duration-500 ease-in-out md:translate-x-0 md:static flex flex-col h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-10 px-2 flex items-center space-x-4" onClick={() => navigateTo(AppView.HOME)}>
          <Logo size="md" />
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter leading-none text-white">JW Study</span>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">Assistant Pro</span>
          </div>
        </div>

        <nav className="space-y-3 flex-1">
          <NavItem icon={HomeIcon} label="Accueil" active={view === AppView.HOME} onClick={() => navigateTo(AppView.HOME)} />
          <NavItem icon={Calendar} label="Vie et Ministère" active={view === AppView.MINISTRY} onClick={() => navigateTo(AppView.MINISTRY)} />
          <NavItem icon={BookOpen} label="Tour de Garde" active={view === AppView.WATCHTOWER} onClick={() => navigateTo(AppView.WATCHTOWER)} />
          <NavItem icon={HistoryIcon} label="Historique" active={view === AppView.HISTORY} onClick={() => navigateTo(AppView.HISTORY)} />
          <NavItem icon={HelpCircle} label="Tutoriel" active={view === AppView.TUTORIAL} onClick={() => navigateTo(AppView.TUTORIAL)} />
          <NavItem icon={SettingsIcon} label="Paramètres" active={view === AppView.SETTINGS} onClick={() => navigateTo(AppView.SETTINGS)} />
        </nav>

        <div className="mt-6 pt-6 border-t border-zinc-800">
           <div className="flex items-center space-x-3 text-zinc-500 text-xs font-bold uppercase tracking-widest p-2">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span>Serveur Actif</span>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative h-screen scroll-smooth">
        <div className="max-w-5xl mx-auto">
          {/* Back Nav for sub-sections */}
          {view !== AppView.HOME && (
            <button 
              onClick={() => navigateTo(AppView.HOME)}
              className="flex items-center space-x-2 text-zinc-400 hover:text-white mb-10 transition-colors group px-2"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold">Retour à l'accueil</span>
            </button>
          )}

          {view === AppView.HOME && (
            <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div className="relative group" onClick={() => navigateTo(AppView.TUTORIAL)}>
                 <div className="absolute -inset-4 bg-blue-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                 <Logo size="lg" />
               </div>
               
               <div className="space-y-6">
                  <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tighter leading-[0.9]">
                    Étudiez avec <br/> profondeur.
                  </h1>
                  <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-bold tracking-tight opacity-80">
                    Générez des réponses détaillées, des commentaires et trouvez des leçons pratiques pour vos réunions.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
                  <button onClick={() => navigateTo(AppView.MINISTRY)} className="p-10 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-[3rem] hover:border-blue-500/50 hover:bg-zinc-800 transition-all group text-left shadow-2xl relative overflow-hidden active:scale-[0.98]">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                      <Calendar className="text-blue-500" size={32} />
                    </div>
                    <h3 className="font-black text-3xl mb-3 text-zinc-100">Vie et Ministère</h3>
                    <p className="text-zinc-500 font-bold leading-relaxed">Préparez vos perles et trouvez les 6 leçons de l'étude biblique.</p>
                  </button>

                  <button onClick={() => navigateTo(AppView.WATCHTOWER)} className="p-10 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-[3rem] hover:border-blue-500/50 hover:bg-zinc-800 transition-all group text-left shadow-2xl relative overflow-hidden active:scale-[0.98]">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/20">
                      <BookOpen className="text-blue-500" size={32} />
                    </div>
                    <h3 className="font-black text-3xl mb-3 text-zinc-100">La Tour de Garde</h3>
                    <p className="text-zinc-500 font-bold leading-relaxed">Réponses à TOUS les paragraphes et questions de révision.</p>
                  </button>
               </div>

               <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                 <span className="px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">JW.ORG Sources</span>
                 <span className="px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800">TMN Bible</span>
                 <span className="px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 text-blue-500">IA Gemini Pro</span>
               </div>
            </div>
          )}

          {view === AppView.MINISTRY && <StudyTool type="MINISTRY" onGenerated={handleStudyGenerated} />}
          {view === AppView.WATCHTOWER && <StudyTool type="WATCHTOWER" onGenerated={handleStudyGenerated} />}
          {view === AppView.HISTORY && <History history={history} setHistory={setHistory} />}
          {view === AppView.SETTINGS && <Settings settings={settings} setSettings={setAppSettings} />}
          {view === AppView.TUTORIAL && <Tutorial />}
        </div>
      </main>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
