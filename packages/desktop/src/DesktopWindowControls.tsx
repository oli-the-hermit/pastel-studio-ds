import { useEffect, useState } from 'react';
import { WindowControls, type WindowControlsProps } from '@pastel-studio/react';
import { closeWindow, minimizeWindow, toggleMaximizeWindow, watchMaximized } from './window';

// A window call that fails (the window is already going away) has nothing to tell the person.
const run = (call: () => Promise<void>) => () => void call().catch(() => {});

export type DesktopWindowControlsProps = Omit<WindowControlsProps, 'maximized' | 'onMinimize' | 'onToggleMaximize' | 'onClose'>;

/** WindowControls wired to the Tauri window, following its maximized state. Render it only when `isDesktop()`. */
export function DesktopWindowControls(props: DesktopWindowControlsProps) {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    let off: (() => void) | undefined;
    let cancelled = false;
    watchMaximized(setMaximized)
      .then((fn) => (cancelled ? fn() : (off = fn)))
      .catch(() => {
        // Without the state the middle button still toggles; it only keeps the "maximize" look.
      });
    return () => {
      cancelled = true;
      off?.();
    };
  }, []);

  return <WindowControls {...props} maximized={maximized} onMinimize={run(minimizeWindow)} onToggleMaximize={run(toggleMaximizeWindow)} onClose={run(closeWindow)} />;
}
