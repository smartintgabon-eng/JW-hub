
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
  Share2,
  Download,
  Trash2,
  RefreshCw,
  Search,
  Home as HomeIcon
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

  useEffect(() => {
    document.body.style.backgroundColor = settings.customHex || settings.backgroundColor;
  }, [settings]);

  const navigateTo = (newView: AppView) => {
    setView(newView);
    setIsSidebarOpen(false);
  };

  const handleStudyGenerated = (study: GeneratedStudy) => {
    saveToHistory(study);
    setHistory(getHistory());
    navigateTo(AppView.HISTORY);
  };

  const NavItem = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row transition-colors duration-500">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-zinc-900/50 border-b border-zinc-800 sticky top-0 z-50 backdrop-blur-md">
        <button onClick={() => navigateTo(AppView.HOME)} className="flex items-center space-x-2 active:scale-95 transition-transform">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">W</div>
          <span className="font-bold text-lg">JW Study</span>
        </button>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-400">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar / Sidebar Overlay */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-zinc-900 border-r border-zinc-800 p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <button onClick={() => navigateTo(AppView.HOME)} className="hidden md:flex items-center space-x-3 mb-10 px-2 group active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-xl text-white shadow-xl shadow-blue-500/20 group-hover:rotate-3 transition-transform">W</div>
          <span className="font-bold text-xl tracking-tight">JW Study Pro</span>
        </button>

        <nav className="space-y-2">
          <NavItem icon={HomeIcon} label="Accueil" active={view === AppView.HOME} onClick={() => navigateTo(AppView.HOME)} />
          <NavItem icon={Calendar} label="Vie et Ministère" active={view === AppView.MINISTRY} onClick={() => navigateTo(AppView.MINISTRY)} />
          <NavItem icon={BookOpen} label="Tour de Garde" active={view === AppView.WATCHTOWER} onClick={() => navigateTo(AppView.WATCHTOWER)} />
          <NavItem icon={HistoryIcon} label="Historique" active={view === AppView.HISTORY} onClick={() => navigateTo(AppView.HISTORY)} />
          <NavItem icon={HelpCircle} label="Tutoriel" active={view === AppView.TUTORIAL} onClick={() => navigateTo(AppView.TUTORIAL)} />
          <NavItem icon={SettingsIcon} label="Paramètres" active={view === AppView.SETTINGS} onClick={() => navigateTo(AppView.SETTINGS)} />
        </nav>

        <div className="absolute bottom-8 left-6 right-6">
          <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-700/50">
            <p className="text-xs text-zinc-500 mb-2 font-semibold uppercase tracking-widest">Connectivité</p>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-sm font-medium text-zinc-300">Mode en ligne</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
        <div className="max-w-4xl mx-auto h-full">
          {view === AppView.HOME && (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div className="relative group">
                 <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                 <div className="relative w-32 h-32 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl mb-4 transition-transform group-hover:scale-105">
                    <BookOpen size={64} className="text-blue-500" />
                 </div>
               </div>
               
               <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tighter">
                    Préparez-vous <br/> avec Excellence.
                  </h1>
                  <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
                    L'assistant intelligent pour approfondir votre étude personnelle de la Bible et de nos publications.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
                  <button onClick={() => navigateTo(AppView.MINISTRY)} className="p-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-[2.5rem] hover:border-blue-500/50 hover:bg-zinc-800/80 transition-all group text-left shadow-lg">
                    <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Calendar className="text-blue-500" size={28} />
                    </div>
                    <h3 className="font-black text-2xl mb-2 text-zinc-100">Vie et Ministère</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">Réponses pour les perles, exposés et l'étude biblique de l'assemblée.</p>
                  </button>

                  <button onClick={() => navigateTo(AppView.WATCHTOWER)} className="p-8 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-zinc-800/80 transition-all group text-left shadow-lg">
                    <div className="w-12 h-12 bg-indigo-600/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <BookOpen className="text-indigo-500" size={28} />
                    </div>
                    <h3 className="font-black text-2xl mb-2 text-zinc-100">La Tour de Garde</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">Analyses détaillées, réponses structurées et applications bibliques.</p>
                  </button>
               </div>

               <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-zinc-600 uppercase tracking-[0.2em]">
                 <span className="flex items-center space-x-1"><div className="w-1 h-1 bg-zinc-700 rounded-full" /> <span>HORS LIGNE</span></span>
                 <span className="flex items-center space-x-1"><div className="w-1 h-1 bg-zinc-700 rounded-full" /> <span>TMN 2013</span></span>
                 <span className="flex items-center space-x-1"><div className="w-1 h-1 bg-zinc-700 rounded-full" /> <span>RÉFLEXION IA</span></span>
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

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
