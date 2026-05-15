import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Library, 
  Settings, 
  BarChart3, 
  Plus, 
  Search,
  Music,
  Heart,
  User,
  Disc
} from 'lucide-react';
import { useAudio, AudioProvider } from './context/AudioContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import LibraryView from './components/LibraryView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';
import PlayerBar from './components/PlayerBar';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './lib/db';

type View = 'library' | 'stats' | 'favorites' | 'settings';

function MainLayout() {
  const [activeView, setActiveView] = useState<View>('library');
  const { currentSong } = useAudio();

  const renderView = () => {
    switch (activeView) {
      case 'library': return <LibraryView />;
      case 'stats': return <StatsView />;
      case 'favorites': return <LibraryView filter="favorites" />;
      case 'settings': return <SettingsView />;
      default: return <LibraryView />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Search Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/5">
        <h1 className="text-xl font-bold tracking-tight text-white">Dazai Player</h1>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-dazai-dim rounded-full transition-colors">
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mini Player Bar */}
      {currentSong && (
        <PlayerBar />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass px-6 py-4 flex items-center justify-between z-40">
        <NavItem active={activeView === 'library'} onClick={() => setActiveView('library')} icon={<Library size={22} />} label="المكتبة" />
        <NavItem active={activeView === 'favorites'} onClick={() => setActiveView('favorites')} icon={<Heart size={22} />} label="المفضلة" />
        <NavItem active={activeView === 'stats'} onClick={() => setActiveView('stats')} icon={<BarChart3 size={22} />} label="إحصائيات" />
        <NavItem active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={22} />} label="دازاي" />
      </nav>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${active ? 'text-dazai-accent' : 'text-dazai-muted'}`}
    >
      <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-dazai-accent/10' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
    </button>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AudioProvider>
        <MainLayout />
      </AudioProvider>
    </SettingsProvider>
  );
}
