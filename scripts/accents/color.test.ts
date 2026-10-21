import { describe, expect, it } from 'vitest';
import { contrast, deltaE, hexToOklch, hueDistance, oklchToHex } from './color.ts';

describe('color math', () => {
  it('round-trips hex through OKLCH', () => {
    for (const hex of ['#D1DD23', '#5EC8B8', '#0E0F11', '#FFFFFF', '#B3261E']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });

  it('measures WCAG contrast', () => {
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrast('#777777', '#777777')).toBe(1);
  });

  it('fits out-of-gamut colors by lowering chroma', () => {
    expect(oklchToHex({ l: 0.7, c: 0.5, h: 250 })).toMatch(/^#[0-9A-F]{6}$/);
  });

  it('measures the distance between colors and between hues', () => {
    expect(deltaE('#D1DD23', '#D1DD23')).toBe(0);
    expect(deltaE('#000000', '#FFFFFF')).toBeGreaterThan(0.9);
    expect(hueDistance(350, 10)).toBe(20);
    expect(hueDistance(90, 270)).toBe(180);
  });
});
