import React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createThemeStore } from './store';
import { useThemeSync } from './useThemeSync';
import type { ThemeMode } from './theme';
import type { AccentId } from './presets';

const memory = (initial: Record<string, string> = {}) => {
  const data = new Map(Object.entries(initial));
  return { data, getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => void data.set(k, v) };
};

function Probe({ mode, accent, store }: { mode: ThemeMode; accent: AccentId; store: ReturnType<typeof createThemeStore> }) {
  useThemeSync(mode, accent, store);
  return null;
}

const listeners: Array<() => void> = [];
const osDark = { value: false };
const stubOs = () => vi.stubGlobal('matchMedia', (q: string) => ({
  get matches() { return osDark.value && q.includes('dark'); },
  media: q,
  addEventListener: (_: string, fn: () => void) => listeners.push(fn),
  removeEventListener: (_: string, fn: () => void) => listeners.splice(listeners.indexOf(fn), 1),
}));

afterEach(() => {
  vi.unstubAllGlobals();
  listeners.length = 0;
  osDark.value = false;
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
});

describe('useThemeSync', () => {
  it('applies the saved theme and accent and remembers them for the next start', () => {
    const storage = memory();
    const store = createThemeStore({ prefix: 'app', defaultAccent: 'solar-lime', storage });
    render(<Probe mode="light" accent="peach" store={store} />);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(store.getMode()).toBe('light');
    expect(store.getAccent()).toBe('peach');
  });

  it('follows a change of mode and accent', () => {
    const store = createThemeStore({ prefix: 'app', defaultAccent: 'solar-lime', storage: memory() });
    const { rerender } = render(<Probe mode="light" accent="peach" store={store} />);
    rerender(<Probe mode="dark" accent="sky" store={store} />);
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(store.getAccent()).toBe('sky');
  });

  it('follows the OS live while the mode is system, and stops when it is not', () => {
    stubOs();
    const store = createThemeStore({ prefix: 'app', defaultAccent: 'solar-lime', storage: memory() });
    const { rerender, unmount } = render(<Probe mode="system" accent="sage" store={store} />);
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(listeners).toHaveLength(1);
    osDark.value = true;
    act(() => listeners.forEach((fn) => fn()));
    expect(document.documentElement.dataset.theme).toBe('dark');
    rerender(<Probe mode="light" accent="sage" store={store} />);
    expect(listeners).toHaveLength(0);
    unmount();
  });
});
