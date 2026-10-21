/**
 * The accent presets. Each is an OKLCH target; the generator (npm run accents) fits it into sRGB,
 * derives every accent token for both themes, checks contrast and writes palette.json, which
 * the theme module reads at runtime. Solar Lime is the brand color: its tokens are the ones the
 * themes already define, copied as they are. This file is plain data, so the generator can read it
 * under Node: its one import is a type, which Node erases. The names are shared words (accentWord).
 */

import type { Labels } from '../labels';

export const ACCENT_GROUPS = ['vibrant', 'calm', 'muted'] as const;
export type AccentGroup = (typeof ACCENT_GROUPS)[number];

export interface AccentPreset {
  id: string;
  group: AccentGroup;
  /** OKLCH lightness, chroma and hue; chroma is reduced if sRGB can't show it. */
  l: number;
  c: number;
  h: number;
}

export const ACCENT_PRESETS = [
  // Vibrant: as saturated as each hue allows; darker hues stay dark enough to hold their color.
  { id: 'solar-lime', group: 'vibrant', l: 0.86, c: 0.19, h: 112 },
  { id: 'starlight-gold', group: 'vibrant', l: 0.85, c: 0.17, h: 92 },
  { id: 'sunflare', group: 'vibrant', l: 0.82, c: 0.17, h: 72 },
  { id: 'corona-orange', group: 'vibrant', l: 0.76, c: 0.17, h: 52 },
  { id: 'red-giant', group: 'vibrant', l: 0.68, c: 0.2, h: 28 },
  { id: 'pulsar-pink', group: 'vibrant', l: 0.74, c: 0.17, h: 358 },
  { id: 'nebula-magenta', group: 'vibrant', l: 0.7, c: 0.22, h: 335 },
  { id: 'nebula-purple', group: 'vibrant', l: 0.68, c: 0.2, h: 312 },
  { id: 'andromeda-violet', group: 'vibrant', l: 0.68, c: 0.18, h: 292 },
  { id: 'stardust-lavender', group: 'vibrant', l: 0.78, c: 0.13, h: 290 },
  { id: 'moonlight-blue', group: 'vibrant', l: 0.68, c: 0.16, h: 262 },
  { id: 'neptune-azure', group: 'vibrant', l: 0.74, c: 0.14, h: 242 },
  { id: 'comet-cyan', group: 'vibrant', l: 0.82, c: 0.13, h: 215 },
  { id: 'aurora-teal', group: 'vibrant', l: 0.8, c: 0.14, h: 185 },
  { id: 'aurora-green', group: 'vibrant', l: 0.8, c: 0.19, h: 148 },
  { id: 'supernova-mint', group: 'vibrant', l: 0.87, c: 0.15, h: 165 },
  // Calm: pastel, low chroma.
  { id: 'sage', group: 'calm', l: 0.82, c: 0.06, h: 135 },
  { id: 'mint', group: 'calm', l: 0.85, c: 0.07, h: 165 },
  { id: 'aquamarine', group: 'calm', l: 0.84, c: 0.07, h: 192 },
  { id: 'sky', group: 'calm', l: 0.83, c: 0.07, h: 235 },
  { id: 'periwinkle', group: 'calm', l: 0.8, c: 0.08, h: 275 },
  { id: 'lavender', group: 'calm', l: 0.82, c: 0.07, h: 310 },
  { id: 'blush', group: 'calm', l: 0.83, c: 0.07, h: 10 },
  { id: 'peach', group: 'calm', l: 0.85, c: 0.07, h: 55 },
  // Muted: nearly grey.
  { id: 'concrete', group: 'muted', l: 0.8, c: 0.004, h: 100 },
  { id: 'stone', group: 'muted', l: 0.78, c: 0.018, h: 75 },
  { id: 'taupe', group: 'muted', l: 0.74, c: 0.028, h: 55 },
  { id: 'clay', group: 'muted', l: 0.72, c: 0.04, h: 40 },
  { id: 'moss-grey', group: 'muted', l: 0.76, c: 0.03, h: 125 },
  { id: 'fog', group: 'muted', l: 0.86, c: 0.01, h: 230 },
  { id: 'pewter', group: 'muted', l: 0.76, c: 0.016, h: 220 },
  { id: 'slate', group: 'muted', l: 0.72, c: 0.03, h: 255 },
] as const satisfies readonly AccentPreset[];

export type AccentId = (typeof ACCENT_PRESETS)[number]['id'];

/**
 * The preset whose tokens are the themes' own. A lookup that finds no palette entry falls back to
 * it. The app's default accent is not this: it belongs to the app and is passed to its theme store.
 */
export const BASE_ACCENT: AccentId = 'solar-lime';

/** The custom properties a preset sets, in the order palette.json lists their values. */
export const ACCENT_TOKENS = [
  '--ps-accent',
  '--ps-accent-hover',
  '--ps-on-accent',
  '--ps-on-accent-2',
  '--ps-accent-container',
  '--ps-on-accent-container',
  '--ps-accent-text',
  '--ps-focus-ring',
] as const;

/** The shared words that name the presets: colorSolarLime, colorMossGrey… */
export type AccentWord = Extract<keyof Labels, `color${string}`>;

/** The word for a preset's name: 'moss-grey' → colorMossGrey. */
export const accentWord = (id: AccentId) => `color${id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('')}` as AccentWord;

export const isAccentId = (v: unknown): v is AccentId => ACCENT_PRESETS.some((p) => p.id === v);
