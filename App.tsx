
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
  LayoutDashboard
} from 'lucide-react';
import { AppView, GeneratedStudy, AppSettings, StudyPart } from './types';
import { getSettings, getHistory, saveToHistory, deleteFromHistory, saveSettings } from './utils/storage';
import { generateStudyContent } from './services/geminiService';

// Sub-components
import StudyTool from './components/StudyTool';
import History from './components/History';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [settings, setAppSettings] = useState<AppSettings>(getSettings());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<GeneratedStudy[]>(getHistory());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialisation sécurisée pour éviter l'écran noir
    const initSettings = getSettings();
    setAppSettings(initSettings);
    
    const bodyBg = initSettings?.customHex || initSettings?.backgroundColor || '#09090b';
    document.body.style.backgroundColor = bodyBg;
    setIsInitialized(true);
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
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500 font-bold">Initialisation...</div>;
  }

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
        active 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-[1.02]' 
          : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <span className={`font-bold tracking-tight ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-700 font-sans selection:bg-blue-500/30 overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-zinc-900/90 border-b border-zinc-800 sticky top-0 z-50 backdrop-blur-xl">
        <button onClick={() => navigateTo(AppView.HOME)} className="flex items-center space-x-3 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-500/20">W</div>
          <span className="font-black text-xl tracking-tighter">JW Study</span>
        </button>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 bg-zinc-800/50 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar - Always Present on Desktop */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950/80 backdrop-blur-3xl border-r border-zinc-800 p-6 transform transition-transform duration-500 ease-in-out md:translate-x-0 md:static flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button onClick={() => navigateTo(AppView.HOME)} className="hidden md:flex items-center space-x-4 mb-12 px-2 group active:scale-95 transition-transform">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-2xl shadow-blue-600/30 group-hover:rotate-6 transition-transform">W</div>
          <div className="flex flex-col items-start">
            <span className="font-black text-xl tracking-tighter leading-none">JW Study</span>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mt-1 text-left">Assistant Pro</span>
          </div>
        </button>

        <nav className="space-y-3 flex-1">
          <NavItem icon={HomeIcon} label="Accueil" active={view === AppView.HOME} onClick={() => navigateTo(AppView.HOME)} />
          <NavItem icon={Calendar} label="Vie et Ministère" active={view === AppView.MINISTRY} onClick={() => navigateTo(AppView.MINISTRY)} />
          <NavItem icon={BookOpen} label="Tour de Garde" active={view === AppView.WATCHTOWER} onClick={() => navigateTo(AppView.WATCHTOWER)} />
          <NavItem icon={HistoryIcon} label="Historique" active={view === AppView.HISTORY} onClick={() => navigateTo(AppView.HISTORY)} />
          <NavItem icon={HelpCircle} label="Tutoriel" active={view === AppView.TUTORIAL} onClick={() => navigateTo(AppView.TUTORIAL)} />
          <NavItem icon={SettingsIcon} label="Paramètres" active={view === AppView.SETTINGS} onClick={() => navigateTo(AppView.SETTINGS)} />
        </nav>

        <div className="pt-6 mt-6 border-t border-zinc-800">
          <div className="p-5 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80 rounded-[2rem] border border-zinc-800/50 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Connecté</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative scroll-smooth h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Top Back Nav for sub-views */}
          {view !== AppView.HOME && (
            <button 
              onClick={() => navigateTo(AppView.HOME)}
              className="flex items-center space-x-2 text-zinc-500 hover:text-white mb-8 transition-colors group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-bold">Retour à l'accueil</span>
            </button>
          )}

          {view === AppView.HOME && (
            <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
               <div className="relative group">
                 <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                 <div className="relative w-36 h-36 bg-zinc-900 border border-zinc-800/50 rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-4 transition-all group-hover:scale-105 group-hover:-rotate-2">
                    <LayoutDashboard size={72} className="text-blue-500" />
                 </div>
               </div>
               
               <div className="space-y-6">
                  <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tighter leading-[0.9]">
                    L'excellence <br/> spirituelle.
                  </h1>
                  <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-bold tracking-tight opacity-80">
                    Générez des réponses profondes et trouvez des leçons pratiques pour vos réunions.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
                  <button onClick={() => navigateTo(AppView.MINISTRY)} className="p-10 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-[3rem] hover:border-blue-500/50 hover:bg-zinc-800 transition-all group text-left shadow-2xl relative overflow-hidden active:scale-95">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform border border-blue-500/20">
                      <Calendar className="text-blue-500" size={32} />
                    </div>
                    <h3 className="font-black text-3xl mb-3 text-zinc-100">Vie et Ministère</h3>
                    <p className="text-zinc-500 font-bold leading-relaxed">Perles, exposés et étude biblique avec leçons exclusives.</p>
                  </button>

                  <button onClick={() => navigateTo(AppView.WATCHTOWER)} className="p-10 bg-zinc-900/40 backdrop-blur-md border border-zinc-800 rounded-[3rem] hover:border-indigo-500/50 hover:bg-zinc-800 transition-all group text-left shadow-2xl relative overflow-hidden active:scale-95">
                    <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform border border-indigo-500/20">
                      <BookOpen className="text-indigo-500" size={32} />
                    </div>
                    <h3 className="font-black text-3xl mb-3 text-zinc-100">La Tour de Garde</h3>
                    <p className="text-zinc-500 font-bold leading-relaxed">Analyses complètes de tous les paragraphes et révision.</p>
                  </button>
               </div>

               <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                 <span className="flex items-center space-x-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/50"><span>HORS LIGNE OK</span></span>
                 <span className="flex items-center space-x-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800/50"><span>IA GEMINI 2.5</span></span>
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

      {/* Mobile Menu Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
