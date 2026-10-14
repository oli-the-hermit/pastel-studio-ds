import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProgressStatus } from '@pastel-studio/react';

export interface SimulatedTask {
  /** `idle` until it is started, then the statuses of a ProgressBar. */
  status: 'idle' | ProgressStatus;
  /** 0–100. */
  value: number;
  /** Starts it again from the beginning. With `fail`, it stops with an error part of the way. */
  start: (options?: { fail?: boolean }) => void;
  reset: () => void;
}

const STARTING_MS = 1200;
const STEP_MS = 400;
const FAIL_AT = 60;

/**
 * Fake work on timers, for demos: starting (no amount yet), then processing in uneven steps,
 * then completed, or failed part of the way. No backend.
 */
export function useSimulatedTask(): SimulatedTask {
  const [status, setStatus] = useState<SimulatedTask['status']>('idle');
  const [value, setValue] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  const stop = () => window.clearTimeout(timer.current);
  useEffect(() => stop, []);

  const reset = useCallback(() => {
    stop();
    setStatus('idle');
    setValue(0);
  }, []);

  const start = useCallback(({ fail = false } = {}) => {
    stop();
    setStatus('starting');
    setValue(0);
    let done = 0;
    const step = () => {
      done = Math.min(100, done + 6 + Math.round(Math.random() * 12));
      if (fail && done >= FAIL_AT) {
        setValue(FAIL_AT);
        setStatus('failed');
        return;
      }
      setValue(done);
      if (done === 100) {
        setStatus('completed');
        return;
      }
      timer.current = window.setTimeout(step, STEP_MS);
    };
    timer.current = window.setTimeout(() => {
      setStatus('processing');
      step();
    }, STARTING_MS);
  }, []);

  return { status, value, start, reset };
}
