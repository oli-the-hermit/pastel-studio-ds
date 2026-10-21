import { useEffect } from 'react';
import type { AccentId } from './presets';
import type { ThemeStore } from './store';
import { applyTheme, type ThemeMode } from './theme';

/**
 * Keeps the page in the app's theme and accent: the remembered ones on the first frame, then the
 * saved ones as they arrive and change (remembering each), and the OS's, live, while the mode is `system`.
 */
export function useThemeSync(mode: ThemeMode, accent: AccentId, store: ThemeStore, doc: Document = document) {
  useEffect(() => {
    const cached = store.getMode();
    if (cached) applyTheme(cached, store.getAccent(), doc);
  }, [store, doc]);

  useEffect(() => {
    applyTheme(mode, accent, doc);
    store.setMode(mode);
    store.setAccent(accent);
  }, [mode, accent, store, doc]);

  useEffect(() => {
    if (mode !== 'system') return;
    const win = doc.defaultView ?? window;
    const query = win.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system', accent, doc);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [mode, accent, doc]);
}
