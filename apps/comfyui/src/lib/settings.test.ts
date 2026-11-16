import { beforeEach, describe, expect, it, vi } from 'vitest';

const stored = new Map<string, unknown>();
const setting = { get: (id: string) => stored.get(id), set: vi.fn(async (id: string, value: unknown) => void stored.set(id, value)) };
let lightPalette = false;
vi.stubGlobal('comfyAPI', {
  app: { app: { extensionManager: { setting, colorPalette: { getActiveColorPalette: () => ({ light_theme: lightPalette }) } } } },
  api: { api: { fetchApi: vi.fn() } },
});

const { getSettings, loadSettings, setSetting, settingDefinitions } = await import('./settings');
const { followTheme, resolveChoice } = await import('./theme');

beforeEach(() => {
  stored.clear();
  setting.set.mockClear();
  lightPalette = false;
});

describe('settings', () => {
  it('registers every setting hidden, under PastelStudio ids', () => {
    expect(settingDefinitions.every((d) => d.type === 'hidden' && d.id.startsWith('PastelStudio.'))).toBe(true);
  });

  it('reads stored values and replaces bad ones with defaults', () => {
    stored.set('PastelStudio.Theme', 'light');
    stored.set('PastelStudio.Accent', 'not-a-color');
    stored.set('PastelStudio.TextSize', 'huge');
    stored.set('PastelStudio.Spellcheck', false);
    stored.set('PastelStudio.RecentAccents', ['solar-lime', 42]);
    loadSettings();
    const s = getSettings();
    expect(s.theme).toBe('light');
    expect(s.accent).toBe('solar-lime');
    expect(s.textSize).toBe('md');
    expect(s.spellcheck).toBe(false);
    expect(s.recentAccents).toEqual(['solar-lime']);
  });

  it('saves to ComfyUI and updates at once', async () => {
    await setSetting('textSize', 'lg');
    expect(getSettings().textSize).toBe('lg');
    expect(setting.set).toHaveBeenCalledWith('PastelStudio.TextSize', 'lg');
  });

  it('follows ComfyUI\'s palette when the theme is "comfy"', () => {
    expect(resolveChoice('comfy')).toBe('dark');
    lightPalette = true;
    expect(resolveChoice('comfy')).toBe('light');
    expect(resolveChoice('dark')).toBe('dark');
  });

  it('paints a followed element with the theme and the accent tokens', async () => {
    const el = document.createElement('div');
    const release = followTheme(el);
    await setSetting('theme', 'light');
    expect(el.dataset.theme).toBe('light');
    expect(el.style.getPropertyValue('--ps-accent')).not.toBe('');
    release();
    await setSetting('theme', 'dark');
    expect(el.dataset.theme).toBe('light');
  });
});
