import { afterEach, describe, expect, it, vi } from 'vitest';
import { ACCENT_GROUPS, ACCENT_PRESETS, ACCENT_TOKENS, BASE_ACCENT, isAccentId } from './presets';
import { accentTokens, applyTheme, isThemeMode, resolveTheme } from './theme';

const prefersDark = (dark: boolean) => vi.stubGlobal('matchMedia', (q: string) => ({ matches: dark && q.includes('dark'), media: q, addEventListener: () => {}, removeEventListener: () => {} }));

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('style');
});

describe('presets', () => {
  it('has 32 presets in three groups, each with a unique id', () => {
    expect(ACCENT_PRESETS).toHaveLength(32);
    expect(new Set(ACCENT_PRESETS.map((p) => p.id)).size).toBe(32);
    expect([...new Set(ACCENT_PRESETS.map((p) => p.group))]).toEqual([...ACCENT_GROUPS]);
  });

  it('knows which ids are presets', () => {
    expect(isAccentId('solar-lime')).toBe(true);
    expect(isAccentId('violet')).toBe(false);
    expect(isAccentId(null)).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('returns light and dark as they are', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });

  it('follows the OS in system mode, and is light with no preference to read', () => {
    prefersDark(true);
    expect(resolveTheme('system')).toBe('dark');
    prefersDark(false);
    expect(resolveTheme('system')).toBe('light');
    expect(resolveTheme('system', {} as Window)).toBe('light');
  });

  it('recognises its modes', () => {
    expect(['light', 'dark', 'system'].every(isThemeMode)).toBe(true);
    expect(isThemeMode('auto')).toBe(false);
  });
});

describe('accentTokens', () => {
  it('gives every accent token a hex color, in both themes, for every preset', () => {
    for (const { id } of ACCENT_PRESETS) {
      for (const theme of ['dark', 'light'] as const) {
        const tokens = accentTokens(id, theme);
        expect(Object.keys(tokens)).toEqual([...ACCENT_TOKENS]);
        for (const v of Object.values(tokens)) expect(v).toMatch(/^#[0-9A-F]{6}$/);
      }
    }
  });

  it('keeps the base accent exactly as the themes define it', () => {
    expect(accentTokens(BASE_ACCENT, 'dark')['--ps-accent']).toBe('#D1DD23');
    expect(accentTokens(BASE_ACCENT, 'light')['--ps-accent-text']).toBe('#5B6300');
  });

  it('falls back to the base accent for an id it does not know', () => {
    expect(accentTokens('nope' as never, 'dark')).toEqual(accentTokens(BASE_ACCENT, 'dark'));
  });
});

describe('applyTheme', () => {
  it('sets the theme, the color scheme and the accent tokens on the root', () => {
    const resolved = applyTheme('dark', 'moonlight-blue');
    const root = document.documentElement;
    expect(resolved).toBe('dark');
    expect(root.dataset.theme).toBe('dark');
    expect(root.style.colorScheme).toBe('dark');
    expect(root.style.getPropertyValue('--ps-accent').toUpperCase()).toBe(accentTokens('moonlight-blue', 'dark')['--ps-accent']);
  });

  it('resolves system mode before applying, and repaints for another accent', () => {
    prefersDark(true);
    expect(applyTheme('system', 'sage')).toBe('dark');
    prefersDark(false);
    expect(applyTheme('system', 'sage')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    applyTheme('light', 'red-giant');
    expect(document.documentElement.style.getPropertyValue('--ps-accent').toUpperCase()).toBe(accentTokens('red-giant', 'light')['--ps-accent']);
  });

  it('applies to another document, such as a second window', () => {
    const other = document.implementation.createHTMLDocument('mini');
    applyTheme('dark', 'peach', other);
    expect(other.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });
});
