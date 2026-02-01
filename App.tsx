
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
  Home as HomeIcon
} from 'lucide-react';
import { AppView, GeneratedStudy, AppSettings } from './types';
import { getSettings, getHistory, saveToHistory } from './utils/storage';

// Sub-components
import StudyTool from './components/StudyTool';
import History from './components/History';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';

// Utilitaire pour calculer si une couleur est sombre ou claire
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
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const bgColor = settings.customHex || settings.backgroundColor || '#09090b';
    const btnColor = settings.customButtonHex || settings.buttonColor || '#4a70b5';
    const textColor = getContrastColor(bgColor);
    const btnTextColor = getContrastColor(btnColor);

    // Application des variables CSS globales
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--btn-color', btnColor);
    document.documentElement.style.setProperty('--btn-text', btnTextColor);

    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;

    const root = document.getElementById('root');
    if (root) root.style.backgroundColor = bgColor;
    
    setIsReady(true);
  }, [settings]);

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
      style={{ 
        backgroundColor: active ? 'var(--btn-color)' : 'transparent',
        color: active ? 'var(--btn-text)' : 'rgba(161, 161, 170, 1)' 
      }}
      className={`w-full flex items-center space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
        active 
          ? 'shadow-lg scale-[1.02] font-black' 
          : 'hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      <span className="tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans transition-all duration-500 overflow-hidden">
      <header className="md:hidden flex items-center justify-between p-4 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center space-x-3" onClick={() => navigateTo(AppView.HOME)}>
           <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-10 h-10 flex items-center justify-center rounded-lg font-black shadow-lg">JW</div>
           <span className="font-black text-xl tracking-tighter uppercase" style={{ color: 'var(--text-color)' }}>Study</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg bg-white/5" style={{ color: 'var(--text-color)' }}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-black/40 backdrop-blur-3xl border-r border-white/10 p-6 transform transition-transform duration-500 ease-in-out md:translate-x-0 md:static flex flex-col h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-12 px-2 flex items-center space-x-4 cursor-pointer group" onClick={() => navigateTo(AppView.HOME)}>
           <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-14 h-14 flex items-center justify-center rounded-xl font-black text-2xl shadow-xl group-hover:rotate-3 transition-transform">JW</div>
           <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter leading-none uppercase" style={{ color: 'var(--text-color)' }}>Study</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] mt-1 opacity-60">Assistant Pro</span>
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
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative h-screen">
        <div className="max-w-5xl mx-auto h-full">
          {view !== AppView.HOME && (
            <button 
              onClick={() => navigateTo(AppView.HOME)}
              className="flex items-center space-x-2 mb-8 transition-colors group px-4 py-2 bg-white/5 rounded-full border border-white/10"
              style={{ color: 'var(--text-color)' }}
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-bold text-sm">Retour</span>
            </button>
          )}

          {view === AppView.HOME && (
            <div className="flex flex-col items-center justify-center min-h-[75vh] text-center space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
               <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-28 h-28 text-[48px] rounded-[2rem] flex items-center justify-center font-black shadow-2xl hover:scale-110 transition-transform cursor-pointer" onClick={() => navigateTo(AppView.TUTORIAL)}>JW</div>
               
               <div className="space-y-6">
                  <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter leading-[0.9]" style={{ color: 'var(--text-color)' }}>
                    L'excellence <br/> spirituelle.
                  </h1>
                  <p className="text-lg md:text-2xl max-w-2xl mx-auto leading-relaxed font-bold tracking-tight opacity-70" style={{ color: 'var(--text-color)' }}>
                    Étudiez avec profondeur et préparez vos commentaires grâce à l'IA biblique.
                  </p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-3xl">
                  <button onClick={() => navigateTo(AppView.MINISTRY)} className="p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all text-left shadow-2xl group active:scale-[0.98]">
                    <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                      <Calendar size={32} />
                    </div>
                    <h3 className="font-black text-3xl mb-3" style={{ color: 'var(--text-color)' }}>Vie et Ministère</h3>
                    <p className="font-bold leading-relaxed opacity-60 text-sm" style={{ color: 'var(--text-color)' }}>Analyses des perles, exposés et étude biblique de l'assemblée.</p>
                  </button>

                  <button onClick={() => navigateTo(AppView.WATCHTOWER)} className="p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all text-left shadow-2xl group active:scale-[0.98]">
                    <div style={{ backgroundColor: 'var(--btn-color)', color: 'var(--btn-text)' }} className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                      <BookOpen size={32} />
                    </div>
                    <h3 className="font-black text-3xl mb-3" style={{ color: 'var(--text-color)' }}>La Tour de Garde</h3>
                    <p className="font-bold leading-relaxed opacity-60 text-sm" style={{ color: 'var(--text-color)' }}>Réponses complètes paragraphe par paragraphe et révision.</p>
                  </button>
               </div>
            </div>
          )}

          <div style={{ color: 'var(--text-color)' }}>
            {view === AppView.MINISTRY && <StudyTool type="MINISTRY" onGenerated={handleStudyGenerated} settings={settings} />}
            {view === AppView.WATCHTOWER && <StudyTool type="WATCHTOWER" onGenerated={handleStudyGenerated} settings={settings} />}
            {view === AppView.HISTORY && <History history={history} setHistory={setHistory} settings={settings} />}
            {view === AppView.SETTINGS && <Settings settings={settings} setSettings={setAppSettings} />}
            {view === AppView.TUTORIAL && <Tutorial />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
