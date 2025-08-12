// theme-initializer.tsx
'use client';
import React from 'react';

const script = `
(function() {
  try {
    const theme = localStorage.getItem('theme') || 'dark';
    const d = document.documentElement;
    d.classList.remove('dark', 'theme-jungle', 'theme-ocean', 'theme-space');
    if (theme === 'dark') {
      d.classList.add('dark');
    } else {
      d.classList.add('theme-' + theme);
    }
  } catch (e) {
    console.error('Could not set theme', e);
  }
})();
`;

export function ThemeInitializer() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
