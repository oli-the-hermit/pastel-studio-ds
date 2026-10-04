import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ThemeName } from './tokens/types';

// The docs' own theme state: which theme the site uses, and whether examples show
// both themes side by side (compare). Remembered per browser; works without storage too.

interface DocsTheme {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  compare: boolean;
  setCompare: (compare: boolean) => void;
}

const DocsThemeContext = createContext<DocsTheme | null>(null);

function read(key: string): string | null {
  try { return window.localStorage.getItem(key); } catch { return null; }   // private mode, blocked storage
}
function write(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch { /* the choice just isn't remembered */ }
}

function initialTheme(): ThemeName {
  const stored = read('ps-docs-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function DocsThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(initialTheme);
  const [compare, setCompareState] = useState(() => read('ps-docs-compare') === 'true');

  useEffect(() => { document.documentElement.dataset.theme = theme; }, [theme]);

  const value = useMemo<DocsTheme>(() => ({
    theme,
    setTheme: (next) => { setThemeState(next); write('ps-docs-theme', next); },
    compare,
    setCompare: (next) => { setCompareState(next); write('ps-docs-compare', String(next)); },
  }), [theme, compare]);

  return <DocsThemeContext.Provider value={value}>{children}</DocsThemeContext.Provider>;
}

export function useDocsTheme(): DocsTheme {
  const ctx = useContext(DocsThemeContext);
  if (!ctx) throw new Error('useDocsTheme must be used inside DocsThemeProvider');
  return ctx;
}

/** The themes an example shows right now: the site's theme, or both in compare mode. */
export function useExampleThemes(): ThemeName[] {
  const { theme, compare } = useDocsTheme();
  return compare ? ['dark', 'light'] : [theme];
}
