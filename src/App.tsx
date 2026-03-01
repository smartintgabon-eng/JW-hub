import React, { useState, useEffect } from 'react';
import { AppSettings, AppView } from './types';
import { Settings, Mic, Search, BookOpen, Home, Menu, Clock, HelpCircle, ChevronLeft } from 'lucide-react';
import { getContrastTextColor } from './utils/colorUtils';

// Import des composants (assure-toi que les chemins sont bons)
import StudyTool from './components/StudyTool';
import PredicationTool from './components/PredicationTool';
import Discourse from './components/Discourse';
import RecherchesTool from './components/RecherchesTool';
import History from './components/History';
import SettingsView from './components/Settings';
import Tutorial from './components/Tutorial';
import Updates from './components/Updates';
import PreferenceManager from './components/PreferenceManager';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('jw_settings');
    return saved ? JSON.parse(saved) : { btnColor: '#4a70b5', bgColor: '#09090b', language: 'fr', answerPreferences: [] };
  });

  useEffect(() => {
    document.documentElement.style.setProperty('--btn-color', settings.btnColor);
    const textColor = getContrastTextColor(settings.btnColor);
    document.documentElement.style.setProperty('--btn-text', textColor === 'black' ? '#000000' : '#ffffff');
    localStorage.setItem('jw_settings', JSON.stringify(settings));
  }, [settings]);

  const menuItems = [
    { id: AppView.HOME, icon: <Home size={22}/>, label: "Accueil" },
    { id: AppView.WATCHTOWER, icon: <BookOpen size={22}/>, label: "Tour de Garde" },
    { id: AppView.MINISTRY, icon: <Clock size={22}/>, label: "Cahier" },
    { id: AppView.PREDICATION, icon: <Search size={22}/>, label: "Prédication" },
    { id: AppView.DISCOURS, icon: <Mic size={22}/>, label: "Discours" },
    { id: AppView.RECHERCHES, icon: <Search size={22}/>, label: "Recherches" },
    { id: AppView.SETTINGS, icon: <Settings size={22}/>, label: "Paramètres" },
    { id: AppView.TUTORIAL, icon: <HelpCircle size={22}/>, label: "Tutoriel" },
  ];

  const renderView = () => {
    const props = { settings, setSettings, setGlobalLoadingMessage: (m:any)=>console.log(m), onGenerated: ()=>setCurrentView(AppView.HISTORY) };
    switch(currentView) {
      case AppView.WATCHTOWER: return <StudyTool category="tour_de_garde" title="Tour de Garde" icon={<BookOpen/>} {...props} onGenerationComplete={()=>setCurrentView(AppView.HISTORY)}/>;
      case AppView.MINISTRY: return <StudyTool category="cahier_vie_et_ministere" title="Cahier" icon={<Clock/>} {...props} onGenerationComplete={()=>setCurrentView(AppView.HISTORY)}/>;
      case AppView.PREDICATION: return <PredicationTool {...props} />;
      case AppView.DISCOURS: return <Discourse {...props} />;
      case AppView.RECHERCHES: return <RecherchesTool {...props} />;
      case AppView.SETTINGS: return <SettingsView {...props} setView={setCurrentView} />;
      case AppView.PREFERENCE_MANAGER: return <PreferenceManager {...props} />;
      case AppView.TUTORIAL: return <Tutorial />;
      case AppView.UPDATES: return <Updates settings={settings} />;
      case AppView.HISTORY: return <History history={[]} setHistory={()=>{}} settings={settings} />;
      default: return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="col-span-full text-3xl font-black uppercase mb-4">Bonjour, Championne ✨</h2>
          {menuItems.filter(i => i.id !== AppView.HOME).map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 transition-all text-left group">
              <div className="p-4 bg-[var(--btn-color)]/10 text-[var(--btn-color)] rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
              <h3 className="text-xl font-black uppercase tracking-tight">{item.label}</h3>
            </button>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: settings.bgColor, color: '#fff' }}>
      <aside className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 bg-black/20 backdrop-blur-2xl border-r border-white/5 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && <span className="font-black text-xl tracking-tighter">JW <span style={{color: settings.btnColor}}>HUB</span></span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-white/5 rounded-xl"><Menu/></button>
        </div>
        <nav className="mt-10 px-3 space-y-2">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${currentView === item.id ? 'bg-[var(--btn-color)] text-[var(--btn-text)] shadow-lg' : 'text-gray-400 hover:bg-white/5'}`}>
              <div className="min-w-[24px]">{item.icon}</div>
              {isSidebarOpen && <span className="font-bold text-[10px] uppercase tracking-widest">{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>
      <main className={`flex-1 ${isSidebarOpen ? 'ml-64' : 'ml-20'} p-10 transition-all`}>
        {currentView !== AppView.HOME && (
          <button onClick={() => setCurrentView(AppView.HOME)} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase opacity-30 hover:opacity-100"><ChevronLeft size={14}/> Retour</button>
        )}
        {renderView()}
      </main>
    </div>
  );
};

export default App;
