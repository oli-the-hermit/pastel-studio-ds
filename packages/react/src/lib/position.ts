// Where a floating panel goes. Pure functions over sizes, so Popover and Tooltip share them
// and they can be tested without a layout engine.

/** Space kept between a floating panel and the window's edges, in px. */
export const VIEWPORT_MARGIN = 8;

export interface Size {
  width: number;
  height: number;
}

export interface Placement {
  top: number;
  left: number;
  /** The tallest the panel may be; it scrolls past this. */
  maxHeight: number;
  /** Which side of the anchor it ended on; a point menu slid to fit counts as 'below'. */
  side: 'below' | 'above';
}

interface Rect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
}

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), Math.max(min, max));

/** Fits a left edge inside the window. */
function fitLeft(left: number, width: number, viewport: Size, margin: number) {
  return clamp(left, margin, viewport.width - width - margin);
}

/**
 * Beside an element: below it if it fits, else on the side with more room, capped to that
 * side's height (it scrolls past it). Lined up with the anchor's start or end edge.
 */
export function placeBeside(
  anchor: Rect,
  panel: Size,
  viewport: Size,
  { gap = 6, align = 'start', margin = VIEWPORT_MARGIN }: { gap?: number; align?: 'start' | 'end' | 'center'; margin?: number } = {}
): Placement {
  const spaceBelow = viewport.height - anchor.bottom - gap - margin;
  const spaceAbove = anchor.top - gap - margin;
  const side = panel.height <= spaceBelow || spaceBelow >= spaceAbove ? 'below' : 'above';
  const maxHeight = Math.max(120, side === 'below' ? spaceBelow : spaceAbove);
  const height = Math.min(panel.height, maxHeight);
  const start =
    align === 'end' ? anchor.right - panel.width
      : align === 'center' ? anchor.left + anchor.width / 2 - panel.width / 2
        : anchor.left;
  return {
    top: side === 'below' ? anchor.bottom + gap : anchor.top - gap - height,
    left: fitLeft(start, panel.width, viewport, margin),
    maxHeight,
    side,
  };
}

/**
 * At a point (a right-click): below and to the right of it when that fits, else above or to the
 * left. When it fits on neither side it slides up until its bottom meets the window's, so it is
 * never shorter than its content while the window can hold it. Only a panel taller than the
 * whole window is capped.
 */
export function placeAtPoint(
  point: { x: number; y: number },
  panel: Size,
  viewport: Size,
  { gap = 2, margin = VIEWPORT_MARGIN }: { gap?: number; margin?: number } = {}
): Placement {
  const maxHeight = Math.max(120, viewport.height - 2 * margin);
  const height = Math.min(panel.height, maxHeight);
  let top: number;
  let side: Placement['side'] = 'below';
  if (point.y + gap + height <= viewport.height - margin) top = point.y + gap;
  else if (point.y - gap - height >= margin) {
    top = point.y - gap - height;
    side = 'above';
  } else top = clamp(viewport.height - margin - height, margin, viewport.height);

  const right = point.x + gap;
  const left = right + panel.width <= viewport.width - margin ? right : point.x - gap - panel.width;
  return { top, left: fitLeft(left, panel.width, viewport, margin), maxHeight, side };
}

/**
 * Keeps a point menu's top edge where it was while its rows change (a submenu opens in place),
 * moving it up only as far as it must to stay inside the window.
 */
export function keepTop(previousTop: number, height: number, viewport: Size, margin = VIEWPORT_MARGIN) {
  return clamp(Math.min(previousTop, viewport.height - margin - height), margin, viewport.height);
}

/** How many columns of `columnWidth` the window is wide enough for (at least 1). */
export function maxColumns(
  columnWidth: number,
  viewport: Size,
  { gap = 0, margin = VIEWPORT_MARGIN }: { gap?: number; margin?: number } = {}
) {
  if (columnWidth <= 0) return 1;
  return Math.max(1, Math.floor((viewport.width - 2 * margin + gap) / (columnWidth + gap)));
}

/**
 * How many columns a menu needs to fit a short window without scrolling: 1 when it fits, else
 * enough columns of `columnWidth` to hold `height`, as many as the window is wide enough for.
 */
export function menuColumns(
  height: number,
  columnWidth: number,
  viewport: Size,
  { gap = 0, margin = VIEWPORT_MARGIN }: { gap?: number; margin?: number } = {}
) {
  const available = viewport.height - 2 * margin;
  if (height <= available || columnWidth <= 0) return 1;
  return Math.min(maxColumns(columnWidth, viewport, { gap, margin }), Math.ceil(height / available));
}
