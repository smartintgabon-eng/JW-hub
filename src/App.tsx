import React, { useState } from 'react';
import { AppSettings, AppView } from './types';
import Discourse from './components/Discourse.tsx';
import Updates from './components/Updates.tsx';
import StudyTool from './components/StudyTool.tsx';
import PreferenceManager from './components/PreferenceManager.tsx';
import History from './components/History.tsx';
import Tutorial from './components/Tutorial.tsx';
import { Settings, Mic, Search, BookOpen, Home as HomeIcon, Bell, Menu, X, Clock, HelpCircle, Calendar } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    bgColor: '#0a0a0a',
    btnColor: '#4a6da7', // JW Blue
    autoSave: true,
    modelName: 'gemini-3.1-pro-preview',
    answerPreferences: [],
    language: 'fr'
  });

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME: 
        return (
          <div className="max-w-6xl mx-auto p-6 md:p-12 space-y-12 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center text-center py-12 md:py-24">
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8 shadow-xl"
                style={{ backgroundColor: settings.btnColor, boxShadow: `0 20px 40px ${settings.btnColor}40` }}
              >
                <span className="text-4xl font-black text-white tracking-tighter">JW</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white leading-none">
                Préparez-vous.
              </h2>
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-gray-600 italic mb-12">
                Simplement.
              </h3>
              
              <button 
                onClick={() => setCurrentView(AppView.TUTORIAL)}
                style={{ backgroundColor: settings.btnColor }}
                className="px-8 py-4 text-white rounded-full font-bold uppercase tracking-widest transition-all hover:brightness-110 shadow-lg flex items-center gap-2 group"
              >
                Découvrir le tutoriel visuel <HelpCircle size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DashboardCard 
                icon={<Calendar size={48} strokeWidth={1.5} />} 
                title="CAHIER" 
                desc="Réunions de semaine" 
                onClick={() => setCurrentView(AppView.MINISTRY)} 
                btnColor={settings.btnColor}
              />
              <DashboardCard 
                icon={<BookOpen size={48} strokeWidth={1.5} />} 
                title="TOUR DE GARDE" 
                desc="Étude de week-end" 
                onClick={() => setCurrentView(AppView.WATCHTOWER)} 
                btnColor={settings.btnColor}
              />
              <DashboardCard 
                icon={<Search size={48} strokeWidth={1.5} />} 
                title="RECHERCHES" 
                desc="Recherches Avancées" 
                onClick={() => setCurrentView(AppView.RECHERCHES)} 
                btnColor={settings.btnColor}
              />
            </div>
          </div>
        );
      case AppView.MINISTRY: 
        return <StudyTool 
          category="cahier_vie_et_ministere" 
          title="CAHIER DE RÉUNION" 
          icon={<Calendar size={28} />} 
          settings={settings} 
          setGlobalLoadingMessage={setGlobalLoadingMessage}
          showParts={true}
          placeholderLink="https://www.jw.org/fr/..."
          onGenerationComplete={() => setCurrentView(AppView.HISTORY)}
        />;
      case AppView.WATCHTOWER: 
        return <StudyTool 
          category="tour_de_garde" 
          title="TOUR DE GARDE" 
          icon={<BookOpen size={28} />} 
          settings={settings} 
          setGlobalLoadingMessage={setGlobalLoadingMessage}
          placeholderLink="https://www.jw.org/fr/..."
          onGenerationComplete={() => setCurrentView(AppView.HISTORY)}
        />;
      case AppView.PREDICATION: 
        return <StudyTool 
          category="predication_porte_en_porte" 
          title="PRÉPARATION À LA PRÉDICATION" 
          icon={<HomeIcon size={28} />} 
          settings={settings} 
          setGlobalLoadingMessage={setGlobalLoadingMessage}
          showPredicationTypes={true}
          placeholderTheme="Sujet de conversation..."
          onGenerationComplete={() => setCurrentView(AppView.HISTORY)}
        />;
      case AppView.DISCOURS: 
        return <Discourse settings={settings} setGlobalLoadingMessage={setGlobalLoadingMessage} />;
      case AppView.RECHERCHES: 
        return <StudyTool 
          category="recherches" 
          title="RECHERCHES AVANCÉES" 
          icon={<Search size={28} />} 
          settings={settings} 
          setGlobalLoadingMessage={setGlobalLoadingMessage}
          placeholderTheme="Que dit la Bible sur l'avenir"
          onGenerationComplete={() => setCurrentView(AppView.HISTORY)}
        />;
      case AppView.HISTORY:
        return <History settings={settings} />;
      case AppView.TUTORIAL:
        return <Tutorial settings={settings} />;
      case AppView.UPDATES: 
        return <Updates settings={settings} />;
      case AppView.SETTINGS:
        return <PreferenceManager settings={settings} setSettings={setSettings} />;
      default: 
        return null;
    }
  };

  return (
    <div className="flex h-screen text-gray-100 font-sans overflow-hidden selection:bg-white/20" style={{ backgroundColor: settings.bgColor }}>
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-[#050505] border-r border-white/5 shadow-2xl z-10">
        <div className="p-6 flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <SidebarItem icon={<HomeIcon size={20} />} label="ACCUEIL" active={currentView === AppView.HOME} onClick={() => setCurrentView(AppView.HOME)} btnColor={settings.btnColor} />
          
          <div className="h-4"></div>
          
          <SidebarItem icon={<Calendar size={20} />} label="CAHIER" active={currentView === AppView.MINISTRY} onClick={() => setCurrentView(AppView.MINISTRY)} btnColor={settings.btnColor} />
          <SidebarItem icon={<BookOpen size={20} />} label="TOUR DE GARDE" active={currentView === AppView.WATCHTOWER} onClick={() => setCurrentView(AppView.WATCHTOWER)} btnColor={settings.btnColor} />
          
          <div className="h-4"></div>

          <SidebarItem icon={<HomeIcon size={20} />} label="PRÉDICATION" active={currentView === AppView.PREDICATION} onClick={() => setCurrentView(AppView.PREDICATION)} btnColor={settings.btnColor} />
          <SidebarItem icon={<Search size={20} />} label="RECHERCHES" active={currentView === AppView.RECHERCHES} onClick={() => setCurrentView(AppView.RECHERCHES)} btnColor={settings.btnColor} />
          
          <div className="h-4"></div>

          <SidebarItem icon={<Clock size={20} />} label="HISTORIQUE" active={currentView === AppView.HISTORY} onClick={() => setCurrentView(AppView.HISTORY)} btnColor={settings.btnColor} />
          <SidebarItem icon={<Bell size={20} />} label="MISES À JOUR" active={currentView === AppView.UPDATES} onClick={() => setCurrentView(AppView.UPDATES)} btnColor={settings.btnColor} />
          <SidebarItem icon={<HelpCircle size={20} />} label="TUTORIEL" active={currentView === AppView.TUTORIAL} onClick={() => setCurrentView(AppView.TUTORIAL)} btnColor={settings.btnColor} />
          
          <div className="h-4"></div>

          <SidebarItem icon={<Settings size={20} />} label="PARAMÈTRES" active={currentView === AppView.SETTINGS} onClick={() => setCurrentView(AppView.SETTINGS)} btnColor={settings.btnColor} />
          <SidebarItem icon={<Mic size={20} />} label="DISCOURS" active={currentView === AppView.DISCOURS} onClick={() => setCurrentView(AppView.DISCOURS)} btnColor={settings.btnColor} />
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 shadow-md z-50 flex items-center justify-between px-4" style={{ backgroundColor: settings.btnColor }}>
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-white/80 hover:text-white">
          <Menu size={24} />
        </button>
        <span className="font-bold text-lg tracking-widest text-white">JW STUDY</span>
        <button onClick={() => setCurrentView(AppView.SETTINGS)} className="p-2 text-white/80 hover:text-white">
          <Settings size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-72 bg-[#0a0a0a] h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 flex justify-between items-center border-b border-white/10" style={{ backgroundColor: settings.btnColor }}>
              <span className="font-bold text-lg tracking-widest text-white">MENU</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-white/10 rounded-lg text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <SidebarItem icon={<HomeIcon size={20} />} label="ACCUEIL" active={currentView === AppView.HOME} onClick={() => { setCurrentView(AppView.HOME); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<Calendar size={20} />} label="CAHIER" active={currentView === AppView.MINISTRY} onClick={() => { setCurrentView(AppView.MINISTRY); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<BookOpen size={20} />} label="TOUR DE GARDE" active={currentView === AppView.WATCHTOWER} onClick={() => { setCurrentView(AppView.WATCHTOWER); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<HomeIcon size={20} />} label="PRÉDICATION" active={currentView === AppView.PREDICATION} onClick={() => { setCurrentView(AppView.PREDICATION); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<Search size={20} />} label="RECHERCHES" active={currentView === AppView.RECHERCHES} onClick={() => { setCurrentView(AppView.RECHERCHES); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<Clock size={20} />} label="HISTORIQUE" active={currentView === AppView.HISTORY} onClick={() => { setCurrentView(AppView.HISTORY); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<Bell size={20} />} label="MISES À JOUR" active={currentView === AppView.UPDATES} onClick={() => { setCurrentView(AppView.UPDATES); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<HelpCircle size={20} />} label="TUTORIEL" active={currentView === AppView.TUTORIAL} onClick={() => { setCurrentView(AppView.TUTORIAL); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<Settings size={20} />} label="PARAMÈTRES" active={currentView === AppView.SETTINGS} onClick={() => { setCurrentView(AppView.SETTINGS); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
              <SidebarItem icon={<Mic size={20} />} label="DISCOURS" active={currentView === AppView.DISCOURS} onClick={() => { setCurrentView(AppView.DISCOURS); setIsMobileMenuOpen(false); }} btnColor={settings.btnColor} />
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 relative scroll-smooth" style={{ backgroundColor: settings.bgColor }}>
        {renderContent()}
      </main>

      {/* Global Loading Overlay */}
      {globalLoadingMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-6" style={{ borderColor: settings.btnColor, borderTopColor: 'transparent' }}></div>
          <p className="text-xl font-bold animate-pulse tracking-widest uppercase" style={{ color: settings.btnColor }}>{globalLoadingMessage}</p>
        </div>
      )}
    </div>
  );
};

// Helper Components
const SidebarItem = ({ icon, label, active, onClick, btnColor }: { icon: any, label: string, active: boolean, onClick: () => void, btnColor: string }) => (
  <button
    onClick={onClick}
    style={active ? { backgroundColor: btnColor, color: '#fff' } : {}}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group relative ${
      active 
        ? 'font-bold shadow-md' 
        : 'text-gray-400 hover:text-white hover:bg-white/5 font-medium'
    }`}
  >
    {React.cloneElement(icon, { size: 20, className: active ? 'text-white' : 'text-gray-500 group-hover:text-gray-300 transition-colors' })}
    <span className="text-xs tracking-widest uppercase">{label}</span>
  </button>
);

const DashboardCard = ({ icon, title, desc, onClick, btnColor }: { icon: any, title: string, desc: string, onClick: () => void, btnColor: string }) => (
  <div 
    onClick={onClick}
    className="group p-8 bg-[#111] border border-white/5 shadow-sm rounded-3xl hover:border-white/20 hover:shadow-lg transition-all cursor-pointer flex flex-col items-center text-center py-12"
  >
    <div className="mb-6 group-hover:scale-110 transition-transform duration-300" style={{ color: btnColor }}>
      {icon}
    </div>
    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{title}</h3>
    <p className="text-sm text-gray-500 font-medium">{desc}</p>
  </div>
);

export default App;
