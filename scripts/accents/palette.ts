/**
 * Builds and audits the accent palette from the presets and the theme tokens. Build-time only: the
 * theme module reads the generated JSON and never ships this code. Imports carry .ts extensions
 * because scripts/accents/generate.ts runs it under plain Node.
 *
 * An app can ask for a partner set: a second family of roles that must never look like the accent
 * (Focus Space's "break" colors beside its focus accent). The library's own palette has none.
 */
import type { AccentPreset } from '../../packages/react/src/theme/presets.ts';
import { contrast, deltaE, hexToOklch, hueDistance, oklchToHex, type Oklch } from './color.ts';

export const THEME_NAMES = ['dark', 'light'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

/** One theme's tokens, resolved to final values (scripts/tokens/parse.ts resolveThemes). */
export type ThemeTokens = Record<ThemeName, ReadonlyMap<string, string>>;

export interface PartnerEntry {
  /** `base` the partner's own colors; `alternative` the fallback when the base looked like the accent. */
  kind: 'base' | 'alternative';
  /** Values in PartnerOptions.tokens order. */
  dark: string[];
  light: string[];
}
export interface PaletteEntry {
  /** Values in the accent token order (the focus ring last). */
  dark: string[];
  light: string[];
  partner?: PartnerEntry;
}
export type Palette = Record<string, PaletteEntry>;

export interface PartnerOptions {
  /** The partner's roles: fill, hover, on, on-2, container, on-container, text. */
  tokens: readonly string[];
  /** Its values per theme in that order, as the app's tokens define them. */
  base: Record<ThemeName, readonly string[]>;
  /** The color it takes when its base would look like the accent. */
  alternative: Oklch;
}

export interface PaletteOptions {
  presets: readonly AccentPreset[];
  /** The preset whose tokens are the themes' own, copied as they are. */
  baseAccent: string;
  /** The eight accent roles, in the order the palette lists them. */
  accentTokens: readonly string[];
  /** Surfaces text and focus rings sit on. */
  surfaces: readonly string[];
  partner?: PartnerOptions;
}

/** Minimum contrast ratios (WCAG 2.2 AA): text 4.5, focus rings and UI parts 3. */
export const RULES = { text: 4.5, ui: 3 } as const;

const hex = (l: number, c: number, h: number) => oklchToHex({ l, c, h });
const minContrast = (fg: string, bgs: string[]) => Math.min(...bgs.map((bg) => contrast(fg, bg)));

/** Walks lightness from `from` toward `to` until `ok` passes; null if it never does. */
function seek(from: number, to: number, c: number, h: number, ok: (x: string) => boolean): string | null {
  const step = from < to ? 0.005 : -0.005;
  for (let l = from; step > 0 ? l <= to + 1e-9 : l >= to - 1e-9; l += step) {
    const x = hex(l, c, h);
    if (ok(x)) return x;
  }
  return null;
}

function need(value: string | null, what: string): string {
  if (!value) throw new Error(`No color meets the contrast rule for ${what}`);
  return value;
}

/**
 * The eight accent roles of one base color in one theme: fill, hover, text on the fill, secondary
 * text on the fill, container, text on the container, accent as text, and the focus ring.
 */
export function deriveRoles(base: Oklch, theme: ThemeName, surfaces: string[], label: string): string[] {
  const fill = hex(base.l, base.c, base.h);
  const { l, c, h } = hexToOklch(fill);
  const dark = theme === 'dark';
  const hover = hex(l + (dark ? 0.035 : -0.035), c, h);

  const darkInk = hex(0.22, Math.min(c * 0.35, 0.05), h);
  const onFill = contrast(darkInk, fill) >= RULES.text ? darkInk : contrast('#FFFFFF', fill) >= RULES.text ? '#FFFFFF' : null;
  const on = need(onFill, `${label} text on the fill`);
  const readsOnFill = (x: string) => contrast(x, fill) >= RULES.text && contrast(x, hover) >= RULES.text;
  const on2 = on === '#FFFFFF'
    ? seek(0.9, 1, Math.min(c * 0.2, 0.04), h, readsOnFill) ?? on
    : need(seek(0.45, 0.2, Math.min(c * 0.8, 0.12), h, readsOnFill), `${label} secondary text on the fill`);

  const container = dark ? hex(0.32, Math.min(c * 0.4, 0.08), h) : hex(0.94, Math.min(c * 0.35, 0.08), h);
  const readsOnContainer = (x: string) => contrast(x, container) >= RULES.text;
  const onContainer = need(
    dark ? seek(0.92, 1, Math.min(c * 0.7, 0.14), h, readsOnContainer) : seek(0.38, 0, Math.min(c * 0.6, 0.11), h, readsOnContainer),
    `${label} text on the container`,
  );

  const readsOnSurfaces = (x: string) => minContrast(x, surfaces) >= RULES.text;
  const text = need(dark ? seek(l, 1, c, h, readsOnSurfaces) : seek(Math.min(l, 0.62), 0, c, h, readsOnSurfaces), `${label} as text`);
  const ring = dark && minContrast(fill, surfaces) >= RULES.ui ? fill : text;

  return [fill, hover, on, on2, container, onContainer, text, ring];
}

/**
 * A partner and an accent must not look alike: when both are colorful their hues sit apart, and
 * overall they are far apart or one is clearly more colorful (a grey beside teal).
 */
export function distinct(a: string, b: string): boolean {
  const [x, y] = [hexToOklch(a), hexToOklch(b)];
  if (x.c >= 0.04 && y.c >= 0.04 && hueDistance(x.h, y.h) < 40) return false;
  return deltaE(a, b) >= 0.12 || Math.abs(x.c - y.c) >= 0.07;
}

const pick = (tokens: ReadonlyMap<string, string>, names: readonly string[]) => names.map((n) => {
  const v = tokens.get(n);
  if (!v || !v.startsWith('#')) throw new Error(`The themes give no color for ${n}`);
  return v.toUpperCase();
});

export function buildPalette(themes: ThemeTokens, options: PaletteOptions): Palette {
  const { presets, baseAccent, accentTokens, surfaces, partner } = options;
  // A partner has every role but the focus ring (the last one).
  const alternative = partner && Object.fromEntries(THEME_NAMES.map((t) => [
    t, deriveRoles(partner.alternative, t, pick(themes[t], surfaces), 'the alternative partner').slice(0, 7),
  ])) as Record<ThemeName, string[]>;

  const palette: Palette = {};
  for (const preset of presets) {
    const accent = Object.fromEntries(THEME_NAMES.map((t) => [
      t,
      preset.id === baseAccent ? pick(themes[t], accentTokens) : deriveRoles(preset, t, pick(themes[t], surfaces), preset.id),
    ])) as Record<ThemeName, string[]>;
    const entry: PaletteEntry = { dark: accent.dark, light: accent.light };
    if (partner && alternative) {
      const kind = distinct(accent.dark[0], partner.base.dark[0]) ? 'base' : 'alternative';
      const roles = kind === 'base' ? { dark: [...partner.base.dark], light: [...partner.base.light] } : alternative;
      entry.partner = { kind, dark: roles.dark, light: roles.light };
    }
    palette[preset.id] = entry;
  }
  return palette;
}

/** Every broken rule in the palette, as readable lines; empty when all pass. */
export function auditPalette(palette: Palette, themes: ThemeTokens, options: Pick<PaletteOptions, 'surfaces' | 'partner'>): string[] {
  const problems: string[] = [];
  for (const [id, entry] of Object.entries(palette)) {
    for (const theme of THEME_NAMES) {
      const surfaces = pick(themes[theme], options.surfaces);
      const expect = (ratio: number, min: number, what: string) => {
        if (ratio < min) problems.push(`${id} (${theme}): ${what} is ${ratio.toFixed(2)}:1, needs ${min}:1`);
      };
      const check = (label: string, [fill, hover, on, on2, container, onContainer, text]: string[]) => {
        expect(contrast(on, fill), RULES.text, `${label}: text on the fill`);
        expect(contrast(on, hover), RULES.text, `${label}: text on the hover fill`);
        expect(contrast(on2, fill), RULES.text, `${label}: secondary text on the fill`);
        expect(contrast(onContainer, container), RULES.text, `${label}: text on the container`);
        expect(minContrast(text, surfaces), RULES.text, `${label} as text on the surfaces`);
      };
      const values = entry[theme];
      check('accent', values);
      expect(minContrast(values[7], surfaces), RULES.ui, 'the focus ring on the surfaces');
      if (options.partner) {
        const partner = entry.partner?.[theme];
        if (!partner) problems.push(`${id} (${theme}): the partner set is missing`);
        else {
          check('partner', partner);
          if (!distinct(values[0], partner[0])) problems.push(`${id} (${theme}): the accent and the partner look alike`);
        }
      }
    }
  }
  return problems;
}
