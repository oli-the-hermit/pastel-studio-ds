import { describe, expect, it } from 'vitest';
import { keepTop, maxColumns, menuColumns, placeAtPoint, placeBeside } from './position';

const window = { width: 1280, height: 800 };

describe('placeAtPoint', () => {
  it('opens below and right of the point when it fits', () => {
    const p = placeAtPoint({ x: 100, y: 100 }, { width: 240, height: 300 }, window);
    expect(p).toMatchObject({ top: 102, left: 102, side: 'below' });
  });

  it('opens above the point when only that side fits', () => {
    const p = placeAtPoint({ x: 100, y: 700 }, { width: 240, height: 300 }, window);
    expect(p).toMatchObject({ top: 398, side: 'above' });
  });

  it('slides to fit, whole, when it fits on neither side of the point', () => {
    // A 700px menu right-clicked in the middle of an 800px window: 400px either side.
    const p = placeAtPoint({ x: 100, y: 400 }, { width: 240, height: 700 }, window);
    expect(p.top).toBe(800 - 8 - 700);
    expect(p.maxHeight).toBe(800 - 16);
    expect(p.top + 700).toBeLessThanOrEqual(800 - 8);
  });

  it('caps only a panel taller than the whole window', () => {
    const p = placeAtPoint({ x: 100, y: 400 }, { width: 240, height: 2000 }, window);
    expect(p.top).toBe(8);
    expect(p.maxHeight).toBe(784);
  });

  it('opens to the left of a point near the right edge', () => {
    const p = placeAtPoint({ x: 1200, y: 100 }, { width: 240, height: 100 }, window);
    expect(p.left).toBe(1200 - 2 - 240);
  });
});

describe('placeBeside', () => {
  const anchor = { top: 100, bottom: 130, left: 200, right: 300, width: 100 };

  it('goes below the anchor, lined up with its start or end', () => {
    expect(placeBeside(anchor, { width: 240, height: 200 }, window)).toMatchObject({ top: 136, left: 200, side: 'below' });
    expect(placeBeside(anchor, { width: 240, height: 200 }, window, { align: 'end' }).left).toBe(60);
  });

  it('centers on the anchor when asked', () => {
    expect(placeBeside(anchor, { width: 50, height: 20 }, window, { align: 'center' }).left).toBe(225);
  });

  it('flips above when there is more room there', () => {
    const low = { top: 700, bottom: 730, left: 200, right: 300, width: 100 };
    expect(placeBeside(low, { width: 240, height: 200 }, window).side).toBe('above');
  });
});

describe('keepTop', () => {
  it('keeps the top edge, moving it up only as far as needed', () => {
    expect(keepTop(300, 200, window)).toBe(300);
    expect(keepTop(700, 200, window)).toBe(800 - 8 - 200);
  });
});

describe('menuColumns', () => {
  it('is 1 when the menu fits', () => {
    expect(menuColumns(700, 240, window)).toBe(1);
  });

  it('spreads a menu taller than a short window into columns', () => {
    expect(menuColumns(700, 240, { width: 1280, height: 420 })).toBe(2);
    expect(menuColumns(700, 240, { width: 1280, height: 300 })).toBe(3);
  });

  it('never takes more columns than the window is wide enough for', () => {
    expect(maxColumns(240, { width: 520, height: 300 }, { gap: 6 })).toBe(2);
    expect(menuColumns(1400, 240, { width: 520, height: 300 }, { gap: 6 })).toBe(2);
  });
});
