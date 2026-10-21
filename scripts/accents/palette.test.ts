import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ACCENT_PRESETS, ACCENT_TOKENS, BASE_ACCENT } from '../../packages/react/src/theme/presets.ts';
import { resolveThemes } from '../tokens/parse.ts';
import { hexToOklch } from './color.ts';
import { OPTIONS, render } from './options.ts';
import { auditPalette, buildPalette, deriveRoles, distinct, RULES, THEME_NAMES, type Palette, type PartnerOptions } from './palette.ts';

const FILE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'packages/react/src/theme/palette.json');
const themes = resolveThemes();
const surfaces = (t: 'dark' | 'light') => OPTIONS.surfaces.map((n) => themes[t].get(n)!.toUpperCase());

// Focus Space's "break" family, as an app with a partner set would hand it over.
const partner: PartnerOptions = {
  tokens: ['--break', '--break-hover', '--on-break', '--on-break-2', '--break-container', '--on-break-container', '--break-text'],
  base: {
    dark: ['#5EC8B8', '#7AD6C8', '#00201C', '#0E4F46', '#103B36', '#A6EEE2', '#5EC8B8'],
    light: ['#5EC8B8', '#4DB8A8', '#00201C', '#0E4F46', '#CBF1EA', '#00443C', '#007569'],
  },
  alternative: { l: 0.74, c: 0.13, h: 32 },
};

describe('the library\'s accent palette', () => {
  const palette = JSON.parse(fs.readFileSync(FILE, 'utf8')) as Palette;

  it('is up to date with the presets and the themes (run npm run accents)', () => {
    expect(fs.readFileSync(FILE, 'utf8').replace(/\r\n/g, '\n')).toBe(render(buildPalette(themes, OPTIONS)));
  });

  it('has an entry per preset with every accent token in both themes, and no partner set', () => {
    expect(Object.keys(palette)).toEqual(ACCENT_PRESETS.map((p) => p.id));
    for (const entry of Object.values(palette)) {
      expect(entry.dark).toHaveLength(ACCENT_TOKENS.length);
      expect(entry.light).toHaveLength(ACCENT_TOKENS.length);
      expect(entry.partner).toBeUndefined();
    }
  });

  it('meets every contrast rule in both themes', () => {
    expect(auditPalette(palette, themes, OPTIONS)).toEqual([]);
  });

  it('keeps the base accent exactly as the themes define it', () => {
    for (const theme of THEME_NAMES) {
      ACCENT_TOKENS.forEach((name, i) => expect(palette[BASE_ACCENT][theme][i]).toBe(themes[theme].get(name)!.toUpperCase()));
    }
  });

  it('keeps each preset\'s hue, so a preset is recognisably itself', () => {
    for (const preset of ACCENT_PRESETS.filter((p) => p.c >= 0.1)) {
      const fill = palette[preset.id].dark[0];
      expect(Math.abs(hexToOklch(fill).h - preset.h), preset.id).toBeLessThan(12);
    }
  });
});

describe('deriveRoles', () => {
  it('gives eight roles that read on the fill, the container and the surfaces', () => {
    for (const theme of THEME_NAMES) {
      const [fill, hover, on, on2, container, onContainer, text, ring] = deriveRoles({ l: 0.68, c: 0.18, h: 292 }, theme, surfaces(theme), 'violet');
      expect(on2).toBeTruthy();
      expect(hover).not.toBe(fill);
      expect(ring).toMatch(/^#[0-9A-F]{6}$/);
      expect(onContainer).not.toBe(container);
      expect(text).toMatch(/^#[0-9A-F]{6}$/);
      expect(on).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it('refuses a color no ink can read on', () => {
    expect(RULES.text).toBe(4.5);
    // Mid-grey: neither the dark ink nor white reaches 4.5:1 on it.
    expect(() => deriveRoles({ l: 0.6, c: 0, h: 0 }, 'dark', surfaces('dark'), 'grey')).toThrow(/text on the fill/);
  });
});

describe('the optional partner set', () => {
  const withPartner = { ...OPTIONS, partner };
  const built = buildPalette(themes, withPartner);

  it('adds a partner to every preset, and the audit passes', () => {
    for (const entry of Object.values(built)) {
      expect(entry.partner?.dark).toHaveLength(partner.tokens.length);
      expect(entry.partner?.light).toHaveLength(partner.tokens.length);
    }
    expect(auditPalette(built, themes, withPartner)).toEqual([]);
  });

  it('uses the base partner where it is clearly another color, and the alternative where it would look like the accent', () => {
    expect(built['solar-lime'].partner?.kind).toBe('base');
    expect(built['aurora-teal'].partner?.kind).toBe('alternative');
    for (const entry of Object.values(built)) expect(distinct(entry.dark[0], entry.partner!.dark[0])).toBe(true);
  });

  it('is not added unless an app asks', () => {
    expect(Object.values(buildPalette(themes, OPTIONS)).every((e) => e.partner === undefined)).toBe(true);
  });
});

describe('distinct', () => {
  it('tells apart colors with far hues, and refuses ones of near hues', () => {
    expect(distinct('#D1DD23', '#5EC8B8')).toBe(true);
    expect(distinct('#5EC8B8', '#4FC0D0')).toBe(false);
  });
});
