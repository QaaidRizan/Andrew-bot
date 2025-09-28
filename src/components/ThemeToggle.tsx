import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDark, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        isDark
          ? 'bg-gray-900 border-gray-700 hover:bg-gray-800'
          : 'bg-white border-gray-200 hover:bg-gray-100'
      }`}
      title="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
    </button>
  );
};