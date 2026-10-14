import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cssDurationMs } from '../../lib/css';
import type { ToastData, ToastTone } from './Toast';

/** How long a toast stays before it slides out. */
const VISIBLE_MS = 3500;

/**
 * The list of toasts for a `ToastRegion`. `showToast` adds one; it slides out by itself after
 * a few seconds and is removed once its exit animation has played.
 */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Set<number>());

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (run: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.current.delete(t);
      run();
    }, ms);
    timers.current.add(t);
  };

  const showToast = useCallback((message: React.ReactNode, tone: ToastTone = 'success') => {
    const id = `ps-toast-${++nextId.current}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    later(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      // Removed once the slide-out transition (--ps-dur-2 in toast.css) has played.
      later(() => setToasts((prev) => prev.filter((t) => t.id !== id)), cssDurationMs('--ps-dur-2'));
    }, VISIBLE_MS);
  }, []);

  return { toasts, showToast };
}
