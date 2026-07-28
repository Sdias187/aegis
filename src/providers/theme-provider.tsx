import { useState, useCallback, type ReactNode } from 'react';
import { ThemeContext } from '@/contexts/theme-context';
import { featureFlags } from '@/config';

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('aegis-theme');
    if (stored) return stored === 'dark';
    return featureFlags.darkModeDefault;
  });

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('aegis-theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
