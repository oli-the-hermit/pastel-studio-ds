import { describe, expect, it } from 'vitest';
import { gridLayout, rowsFromTopRow, sameTopRow, visibleRows } from './gridLayout';

describe('gridLayout', () => {
  it('fits as many tiles as the width holds and stretches them to fill the row', () => {
    // 1000px, tiles of at least 200px, 16px apart: 4 fit (4 × 200 + 3 × 16 = 848), each 238px.
    const layout = gridLayout(1000, 200, 16, 44, 10);
    expect(layout.columns).toBe(4);
    expect(layout.tileWidth).toBe(238);
    expect(layout.rowHeight).toBe(282);
    expect(layout.stride).toBe(298);
    expect(layout.rows).toBe(3);
    expect(layout.height).toBe(3 * 298 - 16);
  });

  it('keeps one column when the width is narrower than a tile, and has no height without items', () => {
    expect(gridLayout(120, 200, 16, 44, 5).columns).toBe(1);
    expect(gridLayout(1000, 200, 16, 44, 0)).toMatchObject({ rows: 0, height: 0 });
  });
});

describe('visibleRows', () => {
  const layout = gridLayout(1000, 200, 16, 44, 400); // 100 rows of 298px

  it('draws the rows in the viewport and the overscan around them', () => {
    expect(visibleRows(layout, 0, 600, 2)).toEqual({ first: 0, last: 5 });
    expect(visibleRows(layout, 2980, 600, 2)).toEqual({ first: 8, last: 15 });
  });

  it('stops at the last row and draws nothing for an empty grid', () => {
    expect(visibleRows(layout, 29500, 600, 3).last).toBe(99);
    expect(visibleRows(gridLayout(1000, 200, 16, 44, 0), 0, 600, 3)).toEqual({ first: 0, last: -1 });
  });
});

describe('rowsFromTopRow', () => {
  const layout = gridLayout(1000, 200, 16, 44, 400); // 100 rows of 298px

  it('gives the same rows wherever in a row the scroll is, with the overscan around the rows on screen', () => {
    for (const row of [0, 1, 37, 90]) {
      const rows = rowsFromTopRow(layout, row * 298, 600, 2);
      for (const within of [0, 1, 150, 297]) {
        const top = row * 298 + within;
        expect(sameTopRow(layout, row * 298, top)).toBe(true);
        expect(rowsFromTopRow(layout, top, 600, 2)).toEqual(rows);
        // The rows a viewport at `top` touches
        const firstOnScreen = Math.floor(top / 298);
        const lastOnScreen = Math.ceil((top + 600) / 298) - 1;
        expect(rows.first).toBe(Math.max(0, firstOnScreen - 2));
        expect(rows.last).toBeGreaterThanOrEqual(lastOnScreen + 2);
      }
      expect(sameTopRow(layout, row * 298, row * 298 + 298)).toBe(false);
    }
  });

  it('never draws more rows than visibleRows does, and stops at the last row', () => {
    expect(rowsFromTopRow(layout, 2980, 600, 2)).toEqual(visibleRows(layout, 2980, 600, 2));
    expect(rowsFromTopRow(layout, 2980 + 297, 600, 2)).toEqual({ first: 8, last: 15 });
    expect(visibleRows(layout, 2980 + 297, 600, 2)).toEqual({ first: 8, last: 16 });
    expect(rowsFromTopRow(layout, 29500, 600, 3).last).toBe(99);
    expect(rowsFromTopRow(gridLayout(1000, 200, 16, 44, 0), 0, 600, 3)).toEqual({ first: 0, last: -1 });
  });

  it('works above the first row, where a header is still on screen', () => {
    expect(rowsFromTopRow(layout, -120, 600, 2)).toEqual({ first: 0, last: 4 });
    expect(sameTopRow(layout, -120, -1)).toBe(true);
    expect(sameTopRow(layout, -1, 0)).toBe(false);
  });
});
