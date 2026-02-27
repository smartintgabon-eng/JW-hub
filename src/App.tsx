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
  const [showPreferences, setShowPreferences] = useState(false);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    bgColor: '#000000',
    btnColor: '#3b82f6', // Bleu plus proche des images
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
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/50">
                <span className="text-4xl font-black text-white tracking-tighter">JW</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-white leading-none">
                Préparez-vous.
              </h2>
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-zinc-700 italic mb-12">
                Simplement.
              </h3>
              
              <button 
                onClick={() => setCurrentView(AppView.TUTORIAL)}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2 group"
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
              />
              <DashboardCard 
                icon={<BookOpen size={48} strokeWidth={1.5} />} 
                title="TOUR DE GARDE" 
                desc="Étude de week-end" 
                onClick={() => setCurrentView(AppView.WATCHTOWER)} 
              />
              <DashboardCard 
                icon={<Search size={48} strokeWidth={1.5} />} 
                title="RECHERCHES" 
                desc="Recherches Avancées" 
                onClick={() => setCurrentView(AppView.RECHERCHES)} 
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
        />;
      case AppView.WATCHTOWER: 
        return <StudyTool 
          category="tour_de_garde" 
          title="TOUR DE GARDE" 
          icon={<BookOpen size={28} />} 
          settings={settings} 
          setGlobalLoadingMessage={setGlobalLoadingMessage}
          placeholderLink="https://www.jw.org/fr/..."
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
          placeholderTheme="Que dit la Bible sur..."
        />;
      case AppView.HISTORY:
        return <History />;
      case AppView.TUTORIAL:
        return <Tutorial />;
      case AppView.UPDATES: 
        return <Updates settings={settings} />;
      default: 
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-black border-r border-zinc-900">
        <div className="p-6 flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
            <X size={20} className="text-white" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <SidebarItem icon={<HomeIcon size={20} />} label="ACCUEIL" active={currentView === AppView.HOME} onClick={() => setCurrentView(AppView.HOME)} />
          
          <div className="h-4"></div>
          
          <SidebarItem icon={<Calendar size={20} />} label="CAHIER" active={currentView === AppView.MINISTRY} onClick={() => setCurrentView(AppView.MINISTRY)} />
          <SidebarItem icon={<BookOpen size={20} />} label="TOUR DE GARDE" active={currentView === AppView.WATCHTOWER} onClick={() => setCurrentView(AppView.WATCHTOWER)} />
          
          <div className="h-4"></div>

          <SidebarItem icon={<HomeIcon size={20} />} label="PRÉDICATION" active={currentView === AppView.PREDICATION} onClick={() => setCurrentView(AppView.PREDICATION)} />
          <SidebarItem icon={<Search size={20} />} label="RECHERCHES" active={currentView === AppView.RECHERCHES} onClick={() => setCurrentView(AppView.RECHERCHES)} />
          
          <div className="h-4"></div>

          <SidebarItem icon={<Clock size={20} />} label="HISTORIQUE" active={currentView === AppView.HISTORY} onClick={() => setCurrentView(AppView.HISTORY)} />
          <SidebarItem icon={<Bell size={20} />} label="MISES À JOUR" active={currentView === AppView.UPDATES} onClick={() => setCurrentView(AppView.UPDATES)} />
          <SidebarItem icon={<HelpCircle size={20} />} label="TUTORIEL" active={currentView === AppView.TUTORIAL} onClick={() => setCurrentView(AppView.TUTORIAL)} />
          
          <div className="h-4"></div>

          <SidebarItem icon={<Settings size={20} />} label="PARAMÈTRES" active={showPreferences} onClick={() => setShowPreferences(true)} />
          <SidebarItem icon={<Mic size={20} />} label="DISCOURS" active={currentView === AppView.DISCOURS} onClick={() => setCurrentView(AppView.DISCOURS)} />
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-md border-b border-zinc-900 z-50 flex items-center justify-between px-4">
        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-400 hover:text-white">
          <Menu size={24} />
        </button>
        <span className="font-bold text-lg tracking-widest">JW STUDY</span>
        <button onClick={() => setShowPreferences(true)} className="p-2 text-gray-400 hover:text-white">
          <Settings size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-72 bg-black h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300 border-r border-zinc-900">
            <div className="p-6 flex justify-between items-center border-b border-zinc-900">
              <span className="font-bold text-lg tracking-widest">MENU</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-zinc-900 rounded-lg text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <SidebarItem icon={<HomeIcon size={20} />} label="ACCUEIL" active={currentView === AppView.HOME} onClick={() => { setCurrentView(AppView.HOME); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Calendar size={20} />} label="CAHIER" active={currentView === AppView.MINISTRY} onClick={() => { setCurrentView(AppView.MINISTRY); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<BookOpen size={20} />} label="TOUR DE GARDE" active={currentView === AppView.WATCHTOWER} onClick={() => { setCurrentView(AppView.WATCHTOWER); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<HomeIcon size={20} />} label="PRÉDICATION" active={currentView === AppView.PREDICATION} onClick={() => { setCurrentView(AppView.PREDICATION); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Search size={20} />} label="RECHERCHES" active={currentView === AppView.RECHERCHES} onClick={() => { setCurrentView(AppView.RECHERCHES); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Clock size={20} />} label="HISTORIQUE" active={currentView === AppView.HISTORY} onClick={() => { setCurrentView(AppView.HISTORY); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Bell size={20} />} label="MISES À JOUR" active={currentView === AppView.UPDATES} onClick={() => { setCurrentView(AppView.UPDATES); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<HelpCircle size={20} />} label="TUTORIEL" active={currentView === AppView.TUTORIAL} onClick={() => { setCurrentView(AppView.TUTORIAL); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Settings size={20} />} label="PARAMÈTRES" active={showPreferences} onClick={() => { setShowPreferences(true); setIsMobileMenuOpen(false); }} />
              <SidebarItem icon={<Mic size={20} />} label="DISCOURS" active={currentView === AppView.DISCOURS} onClick={() => { setCurrentView(AppView.DISCOURS); setIsMobileMenuOpen(false); }} />
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-black relative scroll-smooth">
        {renderContent()}
      </main>

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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
          <p className="text-xl font-bold animate-pulse text-white tracking-widest uppercase">{globalLoadingMessage}</p>
        </div>
      )}
    </div>
  );
};

// Helper Components
const SidebarItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all group relative ${
      active 
        ? 'bg-blue-600/20 text-blue-400 font-bold border-l-4 border-blue-600' 
        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 font-medium'
    }`}
  >
    {React.cloneElement(icon, { size: 20, className: active ? 'text-blue-400' : 'text-zinc-500 group-hover:text-zinc-300 transition-colors' })}
    <span className="text-xs tracking-widest uppercase">{label}</span>
  </button>
);

const DashboardCard = ({ icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="group p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-blue-600/50 hover:bg-zinc-900 transition-all cursor-pointer flex flex-col items-center text-center py-12"
  >
    <div className="mb-6 text-blue-500 group-hover:scale-110 transition-transform duration-300 group-hover:text-blue-400">
      {icon}
    </div>
    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{title}</h3>
    <p className="text-sm text-zinc-500 font-medium">{desc}</p>
  </div>
);

export default App;
