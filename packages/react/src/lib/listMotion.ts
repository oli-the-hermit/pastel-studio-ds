import type React from 'react';
import { useLayoutEffect, useRef } from 'react';
import { cssDurationMs, cssVar } from './css';

/** Ids that appeared after the first render: only rows created now play the enter animation. */
export function useNewIds(ids: string[]): Set<string> {
  const seen = useRef<Set<string> | null>(null);
  const fresh = useRef(new Set<string>());
  if (seen.current === null) {
    seen.current = new Set(ids);
  } else {
    for (const id of ids) {
      if (!seen.current.has(id)) {
        seen.current.add(id);
        fresh.current.add(id);
      }
    }
  }
  return fresh.current;
}

/** When the order changes, rows glide to their new place instead of jumping (FLIP). Rows need a `data-id`. */
export function useFlip(containerRef: React.RefObject<HTMLElement>, ids: string[]) {
  const positions = useRef(new Map<string, number>());
  const orderKey = ids.join('|');

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const base = container.getBoundingClientRect();
    if (base.height === 0) return; // a hidden page: measure the next time it shows
    const next = new Map<string, number>();
    const animate = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timing = { duration: cssDurationMs('--ps-dur-3'), easing: cssVar('--ps-ease-standard') || 'ease' };
    for (const child of Array.from(container.children) as HTMLElement[]) {
      const id = child.dataset.id;
      if (!id) continue;
      const top = child.getBoundingClientRect().top - base.top;
      next.set(id, top);
      const old = positions.current.get(id);
      if (animate && old !== undefined && Math.abs(old - top) > 1) {
        child.animate?.([{ transform: `translateY(${old - top}px)` }, { transform: 'none' }], timing);
      }
    }
    positions.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey]);
}

