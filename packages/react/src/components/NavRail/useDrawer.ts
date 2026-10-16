import { useSyncExternalStore } from 'react';

// Below this there is no room for labels, so the drawer stays a rail (the lg breakpoint).
const EXPANDABLE_QUERY = '(min-width: 1024px)';

// One choice per storage key for the whole window, shared by the drawer and any other toggle.
const stores = new Map<string, { expanded: boolean; listeners: Set<() => void> }>();

function storeFor(key: string) {
  let store = stores.get(key);
  if (!store) {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(key);
    } catch {
      // Storage can be blocked; the drawer then starts as a rail.
    }
    store = { expanded: saved === 'expanded', listeners: new Set() };
    stores.set(key, store);
  }
  return store;
}

function subscribeToQuery(onChange: () => void) {
  const query = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(EXPANDABLE_QUERY) : null;
  query?.addEventListener('change', onChange);
  return () => query?.removeEventListener('change', onChange);
}
const queryMatches = () => typeof window !== 'undefined' && !!window.matchMedia?.(EXPANDABLE_QUERY).matches;

export interface DrawerState {
  /** There is room for the expanded drawer. */
  canExpand: boolean;
  /** Expanded: wanted and there is room. Pass `expanded ? 'expanded' : 'rail'` to NavRail. */
  expanded: boolean;
  toggle: () => void;
}

/**
 * Whether the navigation drawer is expanded: remembered on the device (`storageKey`), and a rail
 * whatever the choice while the window is narrower than 1024px.
 */
export function useDrawer(storageKey = 'ps-drawer'): DrawerState {
  const store = storeFor(storageKey);
  const want = useSyncExternalStore(
    (onChange) => {
      store.listeners.add(onChange);
      return () => store.listeners.delete(onChange);
    },
    () => store.expanded,
    () => false
  );
  const canExpand = useSyncExternalStore(subscribeToQuery, queryMatches, () => false);
  return {
    canExpand,
    expanded: want && canExpand,
    toggle: () => {
      store.expanded = !store.expanded;
      try {
        window.localStorage.setItem(storageKey, store.expanded ? 'expanded' : 'rail');
      } catch {
        // Not remembered, but it still changes for this visit.
      }
      store.listeners.forEach((l) => l());
    },
  };
}
