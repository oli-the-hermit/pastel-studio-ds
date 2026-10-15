import { useCallback, useEffect, useRef, useState } from 'react';
import { isBlockingOverlayOpen } from './overlays';

/**
 * True after `ms` without activity, while `enabled`; never while a menu or a dialog is open.
 * Call the returned `wake` on pointer and key activity. Players hide their controls with it.
 */
export function useIdle(enabled: boolean, ms = 2600) {
  const [idle, setIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const wake = useCallback(() => {
    setIdle(false);
    clearTimeout(timer.current);
    if (!enabled) return;
    timer.current = setTimeout(function check() {
      if (isBlockingOverlayOpen()) timer.current = setTimeout(check, ms);
      else setIdle(true);
    }, ms);
  }, [enabled, ms]);
  useEffect(() => {
    wake();
    return () => clearTimeout(timer.current);
  }, [wake]);
  return [idle, wake] as const;
}
