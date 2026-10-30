import { describe, expect, it } from 'vitest';
import { gridLayout, visibleRows } from './gridLayout';

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
