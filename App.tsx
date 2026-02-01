
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
  LayoutDashboard
} from 'lucide-react';
import { AppView, GeneratedStudy, AppSettings } from './types';
import { getSettings, getHistory, saveToHistory } from './utils/storage';

// Sub-components
import StudyTool from './components/StudyTool';
import History from './components/History';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';

// Composant Logo JW Bleu Ciel
const JWLogo = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg", className?: string }) => {
  const sizes = {
    sm: "w-10 h-10 text-xl rounded-lg",
    md: "w-14 h-14 text-2xl rounded-xl",
    lg: "w-28 h-28 text-5xl rounded-[2rem]"
  };
  return (
    <div className={`${sizes[size]} bg-[#4a70b5] flex items-center justify-center shadow-lg shadow-[#4a70b5]/30 text-white font-black tracking-tighter shrink-0 select-none ${className}`}>
      JW
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [settings, setAppSettings] = useState<AppSettings>(getSettings());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [history, setHistory] = useState<GeneratedStudy[]>(getHistory());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialisation robuste
    try {
      const s = getSettings();
      setAppSettings(s);
      document.body.style.backgroundColor = s.customHex || s.backgroundColor || '#09090b';
      setIsReady(true);
    } catch (e) {
      console.error("Erreur init app:", e);
      setIsReady(true);
    }
  }, []);

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

  if (!isReady) return null;

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
        active 
          ? 'bg-[#4a70b5] text-white shadow-lg shadow-[#4a70b5]/20 scale-[1.02]' 
          : 'text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <span className="font-bold tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-700 font-sans selection:bg-blue-600/30">
      {/* Header Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-zinc-900/95 border-b border-zinc-800 sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigateTo(AppView.HOME)}>
          <JWLogo size="sm" />
          <span className="font-black text-xl tracking-tighter text-white uppercase">Study</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400 bg-zinc-800 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Barre latérale (Sidebar) */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-zinc-950/95 backdrop-blur-3xl border-r border-zinc-800 p-6 transform transition-transform duration-500 ease-in-out md:translate-x-0 md:static flex flex-col h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-12 px-2 flex items-center space-x-4 cursor-pointer group" onClick={() => navigateTo(AppView.HOME)}>
          <JWLogo size="md" className="group-hover:rotate-3 transition-transform" />
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter leading-none text-white uppercase">Study</span>
            <span className="text-[10px] font-black text-[#4a70b5] uppercase tracking-[0.2em] mt-1">Assistant Pro</span>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem icon={HomeIcon} label="Accueil" active={view === AppView.HOME} onClick={() => navigateTo(AppView.HOME)} />
          <NavItem icon={Calendar} label="Vie et Ministère" active={view === AppView.MINISTRY} onClick={() => navigateTo(AppView.MINISTRY)} />
          <NavItem icon={BookOpen} label="Tour de Garde" active={view === AppView.WATCHTOWER} onClick={() => navigateTo(AppView.WATCHTOWER)} />
          <NavItem icon={HistoryIcon} label="Historique" active={view === AppView.HISTORY} onClick={() => navigateTo(AppView.HISTORY)} />
          <NavItem icon={HelpCircle} label="Tutoriel" active={view === AppView.TUTORIAL} onClick={() => navigateTo(AppView.TUTORIAL)} />
          <NavItem icon={SettingsIcon} label="Paramètres" active={view === AppView.SETTINGS} onClick={() => navigateTo(AppView.SETTINGS)} />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-800/50">
           <div className="bg-zinc-900/40 p-4 rounded-2xl flex items-center space-x-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">IA Connectée</span>
           </div>
        </div>
      </aside>

      {/* Zone de contenu principale */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 h-screen relative scroll-smooth bg-transparent">
        <div className="max-w-5xl mx-auto h-full">
          {/* Bouton de retour universel */}
          {view !== AppView.HOME && (
            <button 
              onClick={() => navigateTo(AppView.HOME)}
              className="flex items-center space-x-2 text-zinc-400 hover:text-white mb-8 transition-colors group px-2 py-1 bg-zinc-900/40 w-fit rounded-full pr-4 border border-zinc-800/50"
            >
              <div className="p-1.5 bg-zinc-800 rounded-full">
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              </div>
              <span className="font-bold text-sm">Retour</span>
            </button>
          )}

          {view === AppView.HOME && (
            <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div className="relative group cursor-pointer" onClick={() => navigateTo(AppView.TUTORIAL)}>
                 <div className="absolute -inset-8 bg-[#4a70b5] rounded-[4rem] blur-[4rem] opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                 <JWLogo size="lg" className="hover:scale-110 hover:-rotate-3 transition-all duration-500" />
               </div>
               
               <div className="space-y-6">
                  <h1 className="text-6xl md:text-8xl font-black mb-4 bg-gradient-to-b from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tighter leading-[0.9]">
                    L'excellence <br/> spirituelle.
                  </h1>
                  <p className="text-zinc-400 text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-bold tracking-tight opacity-90">
                    Étudiez avec profondeur et préparez vos commentaires grâce à l'IA biblique.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
                  <button onClick={() => navigateTo(AppView.MINISTRY)} className="p-10 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-[3rem] hover:border-[#4a70b5]/50 hover:bg-zinc-800/60 transition-all group text-left shadow-2xl relative overflow-hidden active:scale-[0.97]">
                    <div className="w-14 h-14 bg-[#4a70b5]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#4a70b5]/20">
                      <Calendar className="text-[#4a70b5]" size={32} />
                    </div>
                    <h3 className="font-black text-3xl mb-3 text-white">Vie et Ministère</h3>
                    <p className="text-zinc-500 font-bold leading-relaxed">Analyses des perles, exposés et étude biblique de l'assemblée.</p>
                  </button>

                  <button onClick={() => navigateTo(AppView.WATCHTOWER)} className="p-10 bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 rounded-[3rem] hover:border-[#4a70b5]/50 hover:bg-zinc-800/60 transition-all group text-left shadow-2xl relative overflow-hidden active:scale-[0.97]">
                    <div className="w-14 h-14 bg-[#4a70b5]/10 rounded-2xl flex items-center justify-center mb-8 border border-[#4a70b5]/20">
                      <BookOpen className="text-[#4a70b5]" size={32} />
                    </div>
                    <h3 className="font-black text-3xl mb-3 text-white">La Tour de Garde</h3>
                    <p className="text-zinc-500 font-bold leading-relaxed">Réponses complètes paragraphe par paragraphe et révision.</p>
                  </button>
               </div>

               <div className="flex flex-wrap justify-center gap-6 text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                 <span className="px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800/50">TMN Bible</span>
                 <span className="px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800/50">Gemini Pro 2.5</span>
                 <span className="px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800/50">Offline Cache</span>
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
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
