import { useEffect } from 'react';
import { isDesktop, isFullscreen, setFullscreen } from './window';

/** F11 toggles the window's full screen and Esc leaves it. Does nothing outside the desktop app. */
export function useFullscreenKeys(): void {
  useEffect(() => {
    if (!isDesktop()) return;
    const onKey = async (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        await setFullscreen(!(await isFullscreen()));
      } else if (e.key === 'Escape' && (await isFullscreen())) {
        await setFullscreen(false);
      }
    };
    const listener = (e: KeyboardEvent) => void onKey(e).catch(() => {});
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, []);
}
