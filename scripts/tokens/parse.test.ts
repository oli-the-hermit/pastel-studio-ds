import { describe, expect, it } from 'vitest';
import { contrastRatio, parseTokenGroups, resolveThemes, THEME_NAMES } from './parse.ts';

describe('parseTokenGroups', () => {
  const css = `
    :root {
      /* ── Space ── px values on a 2px grid.
         The name is the size. */
      --ps-space-2: 2px;
      --ps-space-4: 4px;   /* tight gaps */

      /* ── Radius ── */
      --ps-radius-pill: 999px;
    }
  `;

  it('splits a stylesheet into its titled groups, in order', () => {
    const groups = parseTokenGroups(css);
    expect(groups.map((g) => g.title)).toEqual(['Space', 'Radius']);
    expect(groups[0].description).toBe('px values on a 2px grid. The name is the size.');
    expect(groups[0].tokens.map((t) => t.name)).toEqual(['--ps-space-2', '--ps-space-4']);
  });

  it("keeps each token's value and the note written beside it", () => {
    const [space] = parseTokenGroups(css);
    expect(space.tokens[1]).toEqual({ name: '--ps-space-4', value: '4px', comment: 'tight gaps' });
    expect(space.tokens[0].comment).toBeUndefined();
  });
});

describe('contrastRatio', () => {
  it('follows WCAG: 21 for black on white, 1 for a color on itself, either way round', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21);
    expect(contrastRatio('#D1DD23', '#D1DD23')).toBe(1);
  });
});

describe('resolveThemes', () => {
  it('resolves every role of every theme to a final value', () => {
    const themes = resolveThemes();
    for (const theme of THEME_NAMES) {
      expect(themes[theme].size).toBeGreaterThan(0);
      for (const [name, value] of themes[theme]) expect(value, `${theme} ${name}`).not.toContain('var(');
    }
  });

  it('gives every theme the same roles', () => {
    const themes = resolveThemes();
    expect([...themes.light.keys()].sort()).toEqual([...themes.dark.keys()].sort());
  });
});
