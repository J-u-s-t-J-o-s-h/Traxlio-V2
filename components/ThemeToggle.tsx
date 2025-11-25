'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div
        className={cn(
          'p-2 rounded-xl',
          'bg-slate-200/80 dark:bg-slate-800/80',
          'border border-slate-300 dark:border-slate-600',
          'w-9 h-9',
          className
        )}
      />
    );
  }

  return (
    <motion.button
      onClick={toggleTheme}
      className={cn(
        'relative p-2 rounded-xl transition-colors',
        'bg-slate-200/80 dark:bg-slate-800/80',
        'hover:bg-slate-300/80 dark:hover:bg-slate-700/80',
        'border border-slate-300 dark:border-slate-600',
        className
      )}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 0 : 180,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        {theme === 'dark' ? (
          <Moon className="h-5 w-5 text-slate-300" />
        ) : (
          <Sun className="h-5 w-5 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
};

