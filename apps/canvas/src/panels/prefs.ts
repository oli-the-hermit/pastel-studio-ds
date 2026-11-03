// The person's own conveniences across projects: starred and recently used library items, and panel
// choices. Kept in the browser's storage; losing them loses nothing of a project.
import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();
const cache = new Map<string, unknown>();

function read<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  let value = fallback;
  try {
    const raw = localStorage.getItem(`pastel-canvas:${key}`);
    if (raw) value = JSON.parse(raw) as T;
  } catch {
    // Private mode or blocked storage: the default stands.
  }
  cache.set(key, value);
  return value;
}

export function writePref<T>(key: string, value: T) {
  cache.set(key, value);
  try {
    localStorage.setItem(`pastel-canvas:${key}`, JSON.stringify(value));
  } catch {
    // Not saved for next time; still works now.
  }
  listeners.forEach((l) => l());
}

export function usePref<T>(key: string, fallback: T): [T, (v: T) => void] {
  const value = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => read(key, fallback),
  );
  return [value, (v: T) => writePref(key, v)];
}

/** Library items are keyed "component:Button", "icon:IconStar", "asset:ab12cd". */
export function toggleStar(key: string) {
  const stars = read<string[]>('stars', []);
  writePref('stars', stars.includes(key) ? stars.filter((s) => s !== key) : [key, ...stars]);
}

export function noteUsed(key: string) {
  const recent = read<string[]>('recent', []);
  writePref('recent', [key, ...recent.filter((r) => r !== key)].slice(0, 16));
}
