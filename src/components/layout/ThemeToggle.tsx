import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-9 h-9 rounded-full border border-[#E5E5E5] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-[#F5F5F3] dark:hover:bg-slate-700 text-[#0A1D37] dark:text-white flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A1D37] dark:focus-visible:ring-white shrink-0 cursor-pointer"
    >
      {isDark ? (
        <Moon className="w-4 h-4 text-white" />
      ) : (
        <Sun className="w-4 h-4 text-[#0A1D37]" />
      )}
    </button>
  );
};

export default ThemeToggle;
