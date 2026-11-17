import { useSyncExternalStore } from 'react';
import { api, app } from '../comfy';
import { getSettings } from './settings';

// Whether a newer Pastel Studio exists. The server asks GitHub (pack/pastel_studio/updates.py)
// at most once a day; every node shares this one answer.

export interface UpdateState {
  status: 'off' | 'checking' | 'current' | 'available' | 'error';
  current?: string;
  latest?: string;
  url?: string;
}

interface UpdateResponse {
  current: string;
  latest: string | null;
  url: string | null;
  newer: boolean;
  error: string | null;
}

let state: UpdateState = { status: 'off' };
const listeners = new Set<() => void>();
const set = (next: UpdateState) => {
  state = next;
  listeners.forEach((l) => l());
};

export async function checkForUpdate(force = false): Promise<UpdateState> {
  if (!force && !getSettings().checkUpdates) {
    set({ status: 'off' });
    return state;
  }
  set({ ...state, status: 'checking' });
  try {
    const response = await api.fetchApi(`/pastel/update${force ? '?force=1' : ''}`);
    const data = (await response.json()) as UpdateResponse;
    if (data.error) set({ status: 'error', current: data.current });
    else set({ status: data.newer ? 'available' : 'current', current: data.current, latest: data.latest ?? undefined, url: data.url ?? undefined });
  } catch {
    set({ status: 'error' });
  }
  return state;
}

export function useUpdate(): UpdateState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => state,
  );
}

/**
 * Whether ComfyUI Manager is running. Its command exists in every recent ComfyUI, but without
 * the Manager (ComfyUI started without --enable-manager) it only shows "Not Available".
 */
async function managerRunning(): Promise<boolean> {
  for (const route of ['/v2/manager/version', '/manager/version']) {
    try {
      if ((await api.fetchApi(route)).ok) return true;
    } catch {
      // Not this one; try the older route.
    }
  }
  return false;
}

/** Opens ComfyUI Manager on its list of packs with updates. False when Manager isn't running. */
export async function openManagerUpdates(): Promise<boolean> {
  if (!(await managerRunning())) return false;
  try {
    await app.extensionManager?.command?.execute('Comfy.Manager.ShowUpdateAvailablePacks');
    return true;
  } catch {
    return false;
  }
}

/** Says once per page that an update is ready, not once per node. */
let announced = false;
export function takeAnnouncement(): boolean {
  if (announced || state.status !== 'available') return false;
  announced = true;
  return true;
}
