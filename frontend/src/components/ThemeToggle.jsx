import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ className = "" }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('stocksync_theme') || 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light');
    } else {
      document.body.classList.remove('light');
    }
    localStorage.setItem('stocksync_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center ${
        theme === 'light'
          ? 'bg-white/80 hover:bg-slate-100/90 text-amber-500 border-slate-200 shadow-sm'
          : 'bg-slate-900/60 hover:bg-slate-800/80 text-brand-400 border-slate-800/60 shadow-inner'
      } ${className}`}
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <Sun className="h-4.5 w-4.5 text-amber-500 animate-spin-slow" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-brand-400 transition-transform hover:rotate-12" />
      )}
    </button>
  );
};

export default ThemeToggle;
