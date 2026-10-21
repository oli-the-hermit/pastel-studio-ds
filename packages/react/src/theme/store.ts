import { isAccentId, type AccentId } from './presets';
import { isThemeMode, type ThemeMode } from './theme';

export interface ThemeStoreOptions {
  /** Starts each stored key: `focusspace` gives `focusspace_theme_cache`. Keeps one app's choices from another's. */
  prefix: string;
  /** What a first run, or a value that is no longer a preset, becomes. The app's own: the library does not pick one. */
  defaultAccent: AccentId;
  /** How many picked accents Appearance's Recent colors keeps (default 5). */
  recentMax?: number;
  /** Where to keep them (default `localStorage`); a store that cannot be reached is treated as empty. */
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
}

/**
 * The device's memory of the look: the last theme and accent, so every window paints in them
 * before its data arrives, and the accents picked lately. It never throws: storage can be
 * unavailable (private windows, blocked storage, a full quota) and then nothing is remembered.
 */
export interface ThemeStore {
  getMode(): ThemeMode | null;
  setMode(mode: ThemeMode): void;
  getAccent(): AccentId;
  setAccent(accent: AccentId): void;
  /** Accents picked on this device, newest first. */
  recent(): AccentId[];
  /** Remembers a picked accent and returns the updated list. */
  pushRecent(accent: AccentId): AccentId[];
}

export function createThemeStore({ prefix, defaultAccent, recentMax = 5, storage }: ThemeStoreOptions): ThemeStore {
  const keys = { mode: `${prefix}_theme_cache`, accent: `${prefix}_accent_cache`, recent: `${prefix}_recent_accents` };
  const area = () => {
    try {
      return storage ?? window.localStorage;
    } catch {
      return null;
    }
  };
  const read = (key: string): string | null => {
    try {
      return area()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  };
  const write = (key: string, value: string) => {
    try {
      area()?.setItem(key, value);
    } catch {
      // Storage unavailable or full: nothing to persist to.
    }
  };
  const recent = (): AccentId[] => {
    try {
      const v: unknown = JSON.parse(read(keys.recent) ?? '[]');
      return Array.isArray(v) ? v.filter(isAccentId) : [];
    } catch {
      return [];
    }
  };
  return {
    getMode: () => {
      const v = read(keys.mode);
      return isThemeMode(v) ? v : null;
    },
    setMode: (mode) => write(keys.mode, mode),
    getAccent: () => {
      const v = read(keys.accent);
      return isAccentId(v) ? v : defaultAccent;
    },
    setAccent: (accent) => write(keys.accent, accent),
    recent,
    pushRecent: (accent) => {
      const next = [accent, ...recent().filter((a) => a !== accent)].slice(0, recentMax);
      write(keys.recent, JSON.stringify(next));
      return next;
    },
  };
}
