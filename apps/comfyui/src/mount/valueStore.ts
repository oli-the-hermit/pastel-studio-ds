import { useSyncExternalStore } from 'react';

/**
 * The widget's value lives here, outside React: ComfyUI reads and writes it through the DOM
 * widget's getValue/setValue (saving, loading, undo), and the React UI subscribes to it.
 */
export interface ValueStore {
  get: () => string;
  set: (value: string) => void;
  subscribe: (listener: () => void) => () => void;
}

export function createValueStore(initial: string): ValueStore {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set: (next) => {
      if (next === value) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStoreValue(store: ValueStore): string {
  return useSyncExternalStore(store.subscribe, store.get);
}
