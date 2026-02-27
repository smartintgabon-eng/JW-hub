import React, { useState } from 'react';
import { AppSettings, AppView } from './types';
import Discourse from './components/Discourse.tsx';
import Updates from './components/Updates.tsx';
import PreferenceManager from './components/PreferenceManager.tsx';
import { Settings, Mic, Search, BookOpen, Users, Home as HomeIcon, Bell } from 'lucide-react';

// Placeholder components if they don't exist yet, to prevent build errors
const Home = () => <div className="p-8 text-center">Bienvenue sur l'Assistant Théocratique</div>;
const Ministry = () => <div className="p-8 text-center">Cahier Vie et Ministère</div>;
const Watchtower = () => <div className="p-8 text-center">Étude de La Tour de Garde</div>;
const Predication = () => <div className="p-8 text-center">Outils de Prédication</div>;
const Recherches = () => <div className="p-8 text-center">Recherches Avancées</div>;

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showPreferences, setShowPreferences] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<AppSettings>({
    bgColor: '#1a1a1a',
    btnColor: '#4f46e5',
    autoSave: true,
    modelName: 'gemini-1.5-flash',
    answerPreferences: [],
    language: 'fr'
  });

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME: return <Home />;
      case AppView.MINISTRY: return <Ministry />;
      case AppView.WATCHTOWER: return <Watchtower />;
      case AppView.PREDICATION: return <Predication />;
      case AppView.DISCOURS: return <Discourse settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />;
      case AppView.RECHERCHES: return <Recherches />;
      case AppView.UPDATES: return <Updates settings={settings} />;
      default: return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans selection:bg-[var(--btn-color)] selection:text-white" style={{ '--btn-color': settings.btnColor, '--btn-text': '#ffffff' } as React.CSSProperties}>
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-md border-b border-white/10 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--btn-color)] to-purple-600 flex items-center justify-center shadow-lg shadow-[var(--btn-color)]/20">
            <BookOpen size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tight uppercase hidden md:block">
            Assistant <span className="text-[var(--btn-color)]">Théocratique</span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentView(AppView.UPDATES)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
            title="Mises à jour"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <button 
            onClick={() => setShowPreferences(true)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Préférences"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar Navigation (Desktop) */}
      <aside className="fixed left-0 top-0 bottom-0 w-24 bg-black/40 border-r border-white/10 hidden md:flex flex-col items-center py-24 gap-8 z-30">
        <NavButton icon={<HomeIcon />} label="Accueil" active={currentView === AppView.HOME} onClick={() => setCurrentView(AppView.HOME)} />
        <NavButton icon={<BookOpen />} label="Vie & Min." active={currentView === AppView.MINISTRY} onClick={() => setCurrentView(AppView.MINISTRY)} />
        <NavButton icon={<Users />} label="T. de Garde" active={currentView === AppView.WATCHTOWER} onClick={() => setCurrentView(AppView.WATCHTOWER)} />
        <NavButton icon={<Mic />} label="Discours" active={currentView === AppView.DISCOURS} onClick={() => setCurrentView(AppView.DISCOURS)} />
        <NavButton icon={<Search />} label="Recherches" active={currentView === AppView.RECHERCHES} onClick={() => setCurrentView(AppView.RECHERCHES)} />
      </aside>

      {/* Main Content */}
      <main className="pt-24 pb-24 md:pl-24 min-h-screen">
        {renderContent()}
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-lg border-t border-white/10 md:hidden flex justify-around p-4 z-40 safe-area-bottom">
        <NavButton icon={<HomeIcon size={20} />} label="Accueil" active={currentView === AppView.HOME} onClick={() => setCurrentView(AppView.HOME)} mobile />
        <NavButton icon={<Mic size={20} />} label="Discours" active={currentView === AppView.DISCOURS} onClick={() => setCurrentView(AppView.DISCOURS)} mobile />
        <NavButton icon={<Search size={20} />} label="Rech." active={currentView === AppView.RECHERCHES} onClick={() => setCurrentView(AppView.RECHERCHES)} mobile />
      </nav>

      {/* Modals */}
      {showPreferences && (
        <PreferenceManager 
          settings={settings} 
          setSettings={setSettings} 
          onClose={() => setShowPreferences(false)} 
        />
      )}

      {/* Global Loading Overlay */}
      {globalLoadingMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-[var(--btn-color)] border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-bold animate-pulse">{globalLoadingMessage}</p>
        </div>
      )}
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  mobile?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, mobile }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-[var(--btn-color)] scale-110' : 'text-white/50 hover:text-white'}`}
  >
    <div className={`p-2 rounded-xl ${active ? 'bg-[var(--btn-color)]/10' : ''}`}>
      {icon}
    </div>
    {!mobile && <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>}
  </button>
);

export default App;
