import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { blockingOverlayCount, OverlayDepth } from './overlays';

/** Where a pointer event happened on the screen; a React or a DOM pointer event is one. */
interface ScreenPoint {
  screenX: number;
  screenY: number;
}

/**
 * True after `ms` without activity, while `enabled`; never while a menu or a dialog is open over
 * the caller. Call the returned `wake` on a key, a press or a focus, and give `wakeOnMove` to
 * `onPointerMove`: it wakes only when the pointer is somewhere else on the screen than at its
 * last move. (A browser also sends a move when what is under a resting pointer changes, and a
 * desktop web view sends them over an embedded video all the time: those must not keep the
 * controls up.) Players hide their controls with it. `own` counts blocking overlays the caller
 * opened itself (a dialog idling its own chrome).
 */
export function useIdle(enabled: boolean, ms = 2600, own = 0) {
  const depth = useContext(OverlayDepth) + own;
  const [idle, setIdle] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const lastMove = useRef<ScreenPoint | null>(null);
  const wake = useCallback(() => {
    setIdle(false);
    clearTimeout(timer.current);
    if (!enabled) return;
    timer.current = setTimeout(function check() {
      if (blockingOverlayCount() > depth) timer.current = setTimeout(check, ms);
      else setIdle(true);
    }, ms);
  }, [enabled, ms, depth]);
  const wakeOnMove = useCallback(
    (e: ScreenPoint) => {
      const last = lastMove.current;
      if (last && last.screenX === e.screenX && last.screenY === e.screenY) return;
      lastMove.current = { screenX: e.screenX, screenY: e.screenY };
      wake();
    },
    [wake]
  );
  useEffect(() => {
    wake();
    return () => clearTimeout(timer.current);
  }, [wake]);
  return [idle, wake, wakeOnMove] as const;
}
