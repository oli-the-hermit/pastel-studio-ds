import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { blockingOverlayCount, OverlayDepth } from './overlays';

/**
 * True after `ms` without activity, while `enabled`; never while a menu or a dialog is open over
 * the caller. Call the returned `wake` on pointer and key activity. Players hide their controls
 * with it. `own` counts blocking overlays the caller opened itself (a dialog idling its own chrome).
 */
export function useIdle(enabled: boolean, ms = 2600, own = 0) {
  const depth = useContext(OverlayDepth) + own;
  const [idle, setIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const wake = useCallback(() => {
    setIdle(false);
    clearTimeout(timer.current);
    if (!enabled) return;
    timer.current = setTimeout(function check() {
      if (blockingOverlayCount() > depth) timer.current = setTimeout(check, ms);
      else setIdle(true);
    }, ms);
  }, [enabled, ms, depth]);
  useEffect(() => {
    wake();
    return () => clearTimeout(timer.current);
  }, [wake]);
  return [idle, wake] as const;
}
