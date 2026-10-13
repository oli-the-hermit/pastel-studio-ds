import { useEffect } from 'react';

/**
 * Registry of overlays that pause an app's keyboard shortcuts (modals, menus, anything
 * full-screen). Overlays report themselves while they are on screen, so shortcuts don't
 * depend on CSS class names.
 */
let openCount = 0;

/** Registers the calling overlay as blocking while `active` is true. */
export function useBlockingOverlay(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    openCount++;
    return () => {
      openCount--;
    };
  }, [active]);
}

/** True while a modal or a menu is open: skip app-wide shortcuts. */
export function isBlockingOverlayOpen(): boolean {
  return openCount > 0;
}
