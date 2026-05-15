import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';
type Accent = 'red' | 'blue' | 'emerald' | 'amber' | 'purple';

interface SettingsContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  accent: Accent;
  setAccent: (a: Accent) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const accentColors: Record<Accent, string> = {
  red: '#8E0A0A',
  blue: '#0A4B8E',
  emerald: '#0A8E4B',
  amber: '#8E6E0A',
  purple: '#5E0A8E'
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('dazai-theme') as Theme) || 'dark');
  const [accent, setAccent] = useState<Accent>(() => (localStorage.getItem('dazai-accent') as Accent) || 'red');

  useEffect(() => {
    localStorage.setItem('dazai-theme', theme);
    const root = document.documentElement;
    
    const applyTheme = (t: Theme) => {
      if (t === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.setAttribute('data-theme', isDark ? 'dark' : 'light');
      } else {
        root.setAttribute('data-theme', t);
      }
    };

    applyTheme(theme);

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('dazai-accent', accent);
    document.documentElement.style.setProperty('--dazai-accent', accentColors[accent]);
  }, [accent]);

  return (
    <SettingsContext.Provider value={{ theme, setTheme, accent, setAccent }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
};
