// A long list of rows of one height that draws only the rows near the screen. The page (or a
// panel) scrolls the list, not the list itself: the rows left out are stood for by gaps of the
// same height, so the scrollbar and the scroll position are those of the whole list.
// Shared by TrackList and PlayQueue. The geometry is gridLayout's, as in MediaGrid.
import type React from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { listLayout, rowsFromTopRow, sameTopRow } from './gridLayout';

/** Lists of up to this many rows draw them all. */
export const WINDOWED_ROWS_THRESHOLD = 200;
/** Without a layout (a test, a server, a hidden page) a windowed list draws this many rows. */
const UNMEASURED_COUNT = 48;

export interface WindowedRowsOptions {
  /** How many rows the list has. */
  count: number;
  /** Rows drawn above and below the ones on screen (default 6). */
  overscan?: number;
  /** The list is windowed only with more rows than this (default 200); up to it, every row is drawn. */
  threshold?: number;
  /**
   * Rows that stay drawn wherever the scroll is, by index: the one with the keyboard focus, the
   * one being dragged. An index outside the list is ignored.
   */
  keep?: readonly number[];
}

/** A row to draw, or a gap that stands for the rows left out before the next one. */
export type WindowedSlot =
  | { kind: 'row'; index: number }
  | { kind: 'gap'; key: string; rows: number; height: number };

export interface WindowedRows {
  /** False up to the threshold: every row is drawn, and nothing about the list changes. */
  windowed: boolean;
  /** The first and the last row of the window, `last` inclusive; -1 for `last` when there is nothing to draw. */
  first: number;
  last: number;
  /** The height in px that stands for the rows above `first`, and for those below `last`; 0 for none. */
  before: number;
  after: number;
  /**
   * What to draw, in order: the window's rows, the kept rows outside it, and the gaps between
   * them. Draw a gap as an empty element of that height, hidden from assistive technology.
   */
  slots: WindowedSlot[];
}

/**
 * Lays out what a windowed list draws: rows `first` to `last`, the rows of `keep` outside them,
 * and a gap wherever rows are left out. `gapHeight` gives a gap's height from its number of rows;
 * without it (the row height is not known yet) no gaps are made.
 */
export function windowedSlots(count: number, first: number, last: number, keep: readonly number[] = [], gapHeight?: (rows: number) => number): WindowedSlot[] {
  const kept = [...new Set(keep)].filter((i) => Number.isInteger(i) && i >= 0 && i < count && (i < first || i > last)).sort((a, b) => a - b);
  const drawn = kept.filter((i) => i < first);
  for (let i = Math.max(0, first); i <= last && i < count; i++) drawn.push(i);
  for (const i of kept) if (i > last) drawn.push(i);

  const slots: WindowedSlot[] = [];
  const gap = (rows: number) => {
    if (gapHeight) slots.push({ kind: 'gap', key: `ps-windowed-gap-${slots.length}`, rows, height: gapHeight(rows) });
  };
  let next = 0; // the first row not yet drawn or stood for
  for (const index of drawn) {
    if (index > next) gap(index - next);
    slots.push({ kind: 'row', index });
    next = index + 1;
  }
  if (count > next) gap(count - next);
  return slots;
}

interface Box {
  rowHeight: number;
  /** The space between two rows. */
  gap: number;
  /** The height of what scrolls the list. */
  viewport: number;
}

const NO_BOX: Box = { rowHeight: 0, gap: 0, viewport: 0 };
const NO_KEEP: readonly number[] = [];

/** The nearest element above `list` that scrolls it; null when the page does. */
function scrollerOf(list: HTMLElement): HTMLElement | null {
  const doc = list.ownerDocument;
  for (let node = list.parentElement; node && node !== doc.body && node !== doc.documentElement; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === 'auto' || overflow === 'scroll' || overflow === 'overlay') return node;
  }
  return null;
}

/**
 * Which rows of a long list to draw. Give it the list element's ref: it finds what scrolls the
 * list (the nearest scrolling element above it, or the page), reads the height of a row from the
 * first row drawn and the space between rows from the list's `row-gap`, and follows the scroll
 * and any resize. It answers again once per row scrolled, not at every scroll event.
 *
 * The rows must be the list's children, all of one height, each with a `data-index` attribute;
 * draw `slots` in order, a gap as an empty child of its height. Up to the threshold nothing is
 * windowed. Without a layout the first rows are drawn, with no gaps.
 */
export function useWindowedRows(listRef: React.RefObject<HTMLElement | null>, { count, overscan = 6, threshold = WINDOWED_ROWS_THRESHOLD, keep = NO_KEEP }: WindowedRowsOptions): WindowedRows {
  const windowed = count > threshold;
  const [box, setBox] = useState(NO_BOX);
  // How far the top of what scrolls the list is below the list's top, when the rows were last
  // worked out. A scroll that leaves the same row there doesn't change it.
  const [top, setTop] = useState(0);
  const drawnTop = useRef(0);
  const latest = useRef({ box, count });
  latest.current = { box, count };

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!windowed || !list) return;
    const scroller = scrollerOf(list);
    const view = list.ownerDocument.defaultView ?? window;

    const readTop = () => Math.max(0, (scroller ? scroller.getBoundingClientRect().top : 0) - list.getBoundingClientRect().top);
    const drawFrom = (value: number) => {
      drawnTop.current = value;
      setTop(value);
    };
    const measure = () => {
      const row = Array.from(list.children).find((child) => (child as HTMLElement).dataset.index !== undefined);
      const next: Box = {
        // With no row drawn there is nothing to read: the last height stands.
        rowHeight: row ? row.getBoundingClientRect().height : latest.current.box.rowHeight,
        gap: parseFloat(getComputedStyle(list).rowGap) || 0,
        viewport: scroller ? scroller.clientHeight : view.innerHeight,
      };
      setBox((prev) => (prev.rowHeight === next.rowHeight && prev.gap === next.gap && prev.viewport === next.viewport ? prev : next));
      // Other sizes put other rows at the same scroll position.
      drawFrom(readTop());
    };
    const onScroll = () => {
      const now = latest.current;
      // A list drawn before its size was known measures again as soon as it moves.
      if (now.box.rowHeight <= 0) return measure();
      const value = readTop();
      if (!sameTopRow(listLayout(now.box.rowHeight, now.box.gap, now.count), value, drawnTop.current)) drawFrom(value);
    };

    measure();
    const target: HTMLElement | Window = scroller ?? view;
    target.addEventListener('scroll', onScroll, { passive: true });
    if (!scroller) view.addEventListener('resize', measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(list);
    if (scroller) observer?.observe(scroller);
    return () => {
      target.removeEventListener('scroll', onScroll);
      if (!scroller) view.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [listRef, windowed]);

  if (!windowed) return { windowed, first: 0, last: count - 1, before: 0, after: 0, slots: windowedSlots(count, 0, count - 1) };

  const measured = box.rowHeight > 0;
  if (!measured) {
    const last = Math.min(count, UNMEASURED_COUNT) - 1;
    return { windowed, first: 0, last, before: 0, after: 0, slots: windowedSlots(count, 0, last, keep) };
  }
  const layout = listLayout(box.rowHeight, box.gap, count);
  // A scroll position from a longer list is past the end of this one until the browser pulls it
  // back: draw the rows it will show, not none.
  const from = Math.max(0, Math.min(top, layout.height - box.viewport));
  const { first, last } = rowsFromTopRow(layout, from, box.viewport, overscan);
  // A gap sits between two rows, with the list's own space on each side of it.
  const gapHeight = (rows: number) => Math.max(0, rows * layout.stride - box.gap);
  const below = count - 1 - last;
  return {
    windowed,
    first,
    last,
    before: first > 0 ? gapHeight(first) : 0,
    after: below > 0 ? gapHeight(below) : 0,
    slots: windowedSlots(count, first, last, keep, gapHeight),
  };
}
