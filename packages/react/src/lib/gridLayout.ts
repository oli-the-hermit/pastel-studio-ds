// The geometry of a virtualized grid of square tiles with a caption: how many fit on a row, how
// big each one is and which rows are on screen. A windowed list is the same with one column.
// Pure numbers, so the grid can be tested without a browser's layout.

export interface GridLayout {
  columns: number;
  /** A tile's width (its thumbnail is as tall). */
  tileWidth: number;
  /** A tile's height: the thumbnail and the caption under it. */
  rowHeight: number;
  /** From one row's top to the next: the row and the gap. */
  stride: number;
  rows: number;
  /** The height of all rows, without a gap after the last. */
  height: number;
}

/** Fits as many tiles of at least `min` px as `width` holds, `gap` apart, and stretches them to fill the row. */
export function gridLayout(width: number, min: number, gap: number, caption: number, count: number): GridLayout {
  const columns = Math.max(1, Math.floor((width + gap) / (min + gap)));
  const tileWidth = Math.max(0, (width - gap * (columns - 1)) / columns);
  const rowHeight = tileWidth + caption;
  const stride = rowHeight + gap;
  const rows = Math.ceil(count / columns);
  return { columns, tileWidth, rowHeight, stride, rows, height: rows ? rows * stride - gap : 0 };
}

/** A list as a grid of one column: `count` rows of `rowHeight` px, `gap` px apart. For a list that draws only the rows on screen. */
export function listLayout(rowHeight: number, gap: number, count: number): GridLayout {
  const stride = rowHeight + gap;
  return { columns: 1, tileWidth: 0, rowHeight, stride, rows: count, height: count ? count * stride - gap : 0 };
}

/**
 * The rows to draw for a viewport `top` px into the grid and `viewport` px tall, with `overscan`
 * rows more on each side; `last` is inclusive, and -1 when there is nothing to draw.
 */
export function visibleRows(layout: GridLayout, top: number, viewport: number, overscan: number): { first: number; last: number } {
  if (!layout.rows || layout.stride <= 0) return { first: 0, last: -1 };
  const first = Math.max(0, Math.floor(top / layout.stride) - overscan);
  const last = Math.min(layout.rows - 1, Math.ceil((top + viewport) / layout.stride) + overscan);
  return { first, last: Math.max(first - 1, last) };
}

/**
 * The rows to draw for a grid that is drawn again once per row scrolled, not at every scroll
 * event: `visibleRows` for the top of the row that `top` is in. The answer holds wherever in that
 * row the scroll is: every row on screen is drawn, with at least `overscan` rows on each side.
 * `sameTopRow` says when it still holds.
 */
export function rowsFromTopRow(layout: GridLayout, top: number, viewport: number, overscan: number): { first: number; last: number } {
  if (layout.stride <= 0) return visibleRows(layout, top, viewport, overscan);
  return visibleRows(layout, Math.floor(top / layout.stride) * layout.stride, viewport, overscan);
}

/** Whether two scroll positions have the same row at the top, so `rowsFromTopRow` gives the same rows for both. */
export function sameTopRow(layout: GridLayout, a: number, b: number): boolean {
  if (layout.stride <= 0) return a === b;
  return Math.floor(a / layout.stride) === Math.floor(b / layout.stride);
}
