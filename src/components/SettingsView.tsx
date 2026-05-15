import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { motion } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Monitor, 
  Palette, 
  Info, 
  Github,
  Send
} from 'lucide-react';

export default function SettingsView() {
  const { theme, setTheme, accent, setAccent } = useSettings();

  const accents: { id: any; color: string; label: string }[] = [
    { id: 'red', color: '#8E0A0A', label: 'دازاي' },
    { id: 'blue', color: '#0A4B8E', label: 'عميق' },
    { id: 'emerald', color: '#0A8E4B', label: 'صفاء' },
    { id: 'amber', color: '#8E6E0A', label: 'خريف' },
    { id: 'purple', color: '#5E0A8E', label: 'غموض' },
  ];

  return (
    <div className="p-6 space-y-8">
      <header>
        <h2 className="text-2xl font-bold tracking-tight">إعدادات دازاي</h2>
        <p className="text-xs text-dazai-muted mt-1 uppercase tracking-widest leading-loose">تخصيص التجربة الوجودية</p>
      </header>

      {/* Theme Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-dazai-muted flex items-center gap-2">
          <Sun size={12} /> المظهر العام
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <ThemeButton 
            active={theme === 'light'} 
            onClick={() => setTheme('light')} 
            icon={<Sun size={20} />} 
            label="نهاري" 
          />
          <ThemeButton 
            active={theme === 'dark'} 
            onClick={() => setTheme('dark')} 
            icon={<Moon size={20} />} 
            label="ليلي" 
          />
          <ThemeButton 
            active={theme === 'system'} 
            onClick={() => setTheme('system')} 
            icon={<Monitor size={20} />} 
            label="النظام" 
          />
        </div>
      </section>

      {/* Accent Section */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-dazai-muted flex items-center gap-2">
          <Palette size={12} /> اللون المميز
        </h3>
        <div className="flex flex-wrap gap-3">
          {accents.map(acc => (
            <button
              key={acc.id}
              onClick={() => setAccent(acc.id)}
              className={`flex-1 min-w-[80px] p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-2 ${accent === acc.id ? 'border-dazai-accent bg-dazai-accent/10' : 'border-white/5 bg-white/5'}`}
            >
              <div className="w-6 h-6 rounded-full shadow-lg" style={{ backgroundColor: acc.color }} />
              <span className="text-[10px] font-medium">{acc.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-start gap-4">
           <div className="w-12 h-12 bg-dazai-accent rounded-2xl flex items-center justify-center flex-shrink-0">
             <Disc className="text-white animate-spin-slow" size={24} />
           </div>
           <div>
             <h4 className="font-bold">Dazai Player</h4>
             <p className="text-xs text-dazai-muted leading-relaxed mt-1">
               مشغل موسيقى محلي يركز على الخصوصية والجمالية الوجودية. 
               مصمم لمن يقدرون الصمت بقدر ما يقدرون النغم.
             </p>
           </div>
        </div>
        <div className="flex gap-2">
           <a 
             href="https://github.com/DazaiPlayer" 
             target="_blank" 
             rel="noreferrer"
             className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-2xl text-[10px] uppercase font-bold tracking-widest active:scale-95 transition-transform hover:bg-white/10"
           >
             <Github size={14} /> GitHub
           </a>
           <a 
             href="https://t.me/DazaiPlayer" 
             target="_blank" 
             rel="noreferrer"
             className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 rounded-2xl text-[10px] uppercase font-bold tracking-widest active:scale-95 transition-transform hover:bg-white/10"
           >
             <Send size={14} /> Telegram
           </a>
        </div>
      </section>
    </div>
  );
}

function ThemeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${active ? 'border-dazai-accent bg-dazai-accent/10 text-dazai-accent' : 'border-white/5 bg-white/5 text-dazai-muted'}`}
    >
      {icon}
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function Disc(props: any) {
    return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...props}
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
