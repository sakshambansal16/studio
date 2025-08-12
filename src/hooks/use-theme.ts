'use client';

import { useState, useEffect, useCallback } from 'react';

export const THEMES = ['dark', 'jungle', 'ocean', 'space'];
const THEME_STORAGE_KEY = 'theme';

export function useTheme() {
  const [theme, setThemeState] = useState('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    setThemeState(storedTheme);
  }, []);

  const applyTheme = useCallback((newTheme: string) => {
    const html = document.documentElement;
    html.classList.remove(...THEMES.map(t => t === 'dark' ? t : `theme-${t}`));
    if (newTheme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.add(`theme-${newTheme}`);
    }
  }, []);

  const setTheme = useCallback((newTheme: string) => {
    if (THEMES.includes(newTheme)) {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
      applyTheme(newTheme);
    }
  }, [applyTheme]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  return { theme, setTheme };
}
