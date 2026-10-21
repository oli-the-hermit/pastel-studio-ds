import { describe, expect, it, vi } from 'vitest';
import { createThemeStore } from './store';

const memory = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

describe('createThemeStore', () => {
  it('remembers the mode and the accent under the app\'s prefix', () => {
    const storage = memory();
    const store = createThemeStore({ prefix: 'focusspace', defaultAccent: 'solar-lime', storage });
    expect(store.getMode()).toBeNull();
    store.setMode('dark');
    store.setAccent('sage');
    expect(store.getMode()).toBe('dark');
    expect(store.getAccent()).toBe('sage');
    expect([...storage.data.keys()]).toEqual(['focusspace_theme_cache', 'focusspace_accent_cache']);
  });

  it('gives the app\'s own default accent on a first run and for a value that is no longer a preset', () => {
    const storage = memory({ mp_accent_cache: 'retired-color', mp_theme_cache: 'auto' });
    const store = createThemeStore({ prefix: 'mp', defaultAccent: 'nebula-purple', storage });
    expect(store.getAccent()).toBe('nebula-purple');
    expect(store.getMode()).toBeNull();
  });

  it('keeps one app\'s choices apart from another\'s', () => {
    const storage = memory();
    createThemeStore({ prefix: 'a', defaultAccent: 'sage', storage }).setAccent('mint');
    expect(createThemeStore({ prefix: 'b', defaultAccent: 'sage', storage }).getAccent()).toBe('sage');
  });

  it('lists the recent accents newest first, without repeats, up to its limit', () => {
    const store = createThemeStore({ prefix: 'x', defaultAccent: 'sage', recentMax: 3, storage: memory() });
    expect(store.recent()).toEqual([]);
    store.pushRecent('sage');
    store.pushRecent('mint');
    store.pushRecent('sky');
    expect(store.pushRecent('sage')).toEqual(['sage', 'sky', 'mint']);
    expect(store.pushRecent('blush')).toEqual(['blush', 'sage', 'sky']);
    expect(store.recent()).toEqual(['blush', 'sage', 'sky']);
  });

  it('ignores a stored list that is damaged or holds ids that are gone', () => {
    const broken = createThemeStore({ prefix: 'x', defaultAccent: 'sage', storage: memory({ x_recent_accents: '{oops' }) });
    expect(broken.recent()).toEqual([]);
    const stale = createThemeStore({ prefix: 'x', defaultAccent: 'sage', storage: memory({ x_recent_accents: '["mint","gone",7]' }) });
    expect(stale.recent()).toEqual(['mint']);
  });

  it('never throws when storage is unavailable, and then remembers nothing', () => {
    const storage = {
      getItem: vi.fn(() => { throw new Error('blocked'); }),
      setItem: vi.fn(() => { throw new Error('full'); }),
    };
    const store = createThemeStore({ prefix: 'x', defaultAccent: 'sage', storage });
    expect(() => { store.setMode('light'); store.setAccent('mint'); store.pushRecent('sky'); }).not.toThrow();
    expect(store.getMode()).toBeNull();
    expect(store.getAccent()).toBe('sage');
    expect(store.recent()).toEqual([]);
  });
});
