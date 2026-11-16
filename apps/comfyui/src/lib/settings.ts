import { useSyncExternalStore } from 'react';
import { BASE_ACCENT, isAccentId, isThemeMode, type AccentId, type ThemeMode } from '@pastel-studio/react';
import { app } from '../comfy';

// Pastel Studio's settings live in ComfyUI's own settings store (comfy.settings.json in the
// user folder): per ComfyUI user, saved with ComfyUI. They are registered as hidden, so they
// don't show in ComfyUI's Settings dialog; our Appearance and Settings views edit them.

/** `comfy` follows ComfyUI's light or dark color palette. */
export type ThemeChoice = ThemeMode | 'comfy';
export type TextSize = 'sm' | 'md' | 'lg';

export interface PastelSettings {
  theme: ThemeChoice;
  accent: AccentId;
  recentAccents: AccentId[];
  profileName: string;
  /** Changes when the picture changes, so every node reloads it; empty without one. */
  avatarVersion: string;
  textSize: TextSize;
  spellcheck: boolean;
  showFormatBar: boolean;
}

const DEFAULTS: PastelSettings = {
  theme: 'comfy',
  accent: BASE_ACCENT,
  recentAccents: [],
  profileName: '',
  avatarVersion: '',
  textSize: 'md',
  spellcheck: true,
  showFormatBar: true,
};

const IDS: Record<keyof PastelSettings, string> = {
  theme: 'PastelStudio.Theme',
  accent: 'PastelStudio.Accent',
  recentAccents: 'PastelStudio.RecentAccents',
  profileName: 'PastelStudio.ProfileName',
  avatarVersion: 'PastelStudio.AvatarVersion',
  textSize: 'PastelStudio.TextSize',
  spellcheck: 'PastelStudio.Spellcheck',
  showFormatBar: 'PastelStudio.ShowFormatBar',
};

/** A stored value of the right kind, or the default (settings files can be edited by hand). */
function valid<K extends keyof PastelSettings>(key: K, value: unknown): PastelSettings[K] {
  const fallback = DEFAULTS[key];
  switch (key) {
    case 'theme':
      return (value === 'comfy' || isThemeMode(value) ? value : fallback) as PastelSettings[K];
    case 'accent':
      return (isAccentId(value) ? value : fallback) as PastelSettings[K];
    case 'recentAccents':
      return (Array.isArray(value) ? value.filter(isAccentId) : fallback) as PastelSettings[K];
    case 'textSize':
      return (value === 'sm' || value === 'md' || value === 'lg' ? value : fallback) as PastelSettings[K];
    default:
      return (typeof value === typeof fallback ? value : fallback) as PastelSettings[K];
  }
}

let current: PastelSettings = { ...DEFAULTS };
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

function readAll(): PastelSettings {
  const store = app.extensionManager?.setting;
  const next = { ...DEFAULTS };
  for (const key of Object.keys(IDS) as (keyof PastelSettings)[]) {
    (next as Record<string, unknown>)[key] = valid(key, store?.get(IDS[key]));
  }
  return next;
}

/** For registerExtension: hidden ComfyUI settings whose changes reach every node. */
export const settingDefinitions = (Object.keys(IDS) as (keyof PastelSettings)[]).map((key) => ({
  id: IDS[key],
  name: IDS[key],
  type: 'hidden',
  defaultValue: DEFAULTS[key],
  onChange: (value: unknown) => {
    current = { ...current, [key]: valid(key, value) };
    notify();
  },
}));

/** Reads the stored values once ComfyUI's settings are loaded (the extension's setup). */
export function loadSettings(): void {
  current = readAll();
  notify();
}

export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const getSettings = () => current;

export function useSettings(): PastelSettings {
  return useSyncExternalStore(subscribeSettings, getSettings);
}

export async function setSetting<K extends keyof PastelSettings>(key: K, value: PastelSettings[K]): Promise<void> {
  current = { ...current, [key]: value };
  notify();
  await app.extensionManager?.setting?.set(IDS[key], value);
}

/** Tells settings subscribers that something they derive from changed (ComfyUI's palette, the OS theme). */
export const refreshSettings = notify;
