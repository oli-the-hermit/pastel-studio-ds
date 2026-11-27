import React, { useRef } from 'react';
import { act, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWindowedRows, windowedSlots, type WindowedRows } from './useWindowedRows';

// jsdom has no layout: every size is 0, and a windowed list then draws its first rows with no
// gaps. These tests give it rows of 50 px in a scroller 500 px tall, so it draws the rows on
// screen as a browser does: 10 on screen, and 6 more on each side.
const ROW = 50;
const VIEWPORT = 500;
const OVERSCAN = 6;

/** What the layout would say; a test changes it before it renders. */
const layout = { row: ROW, listTop: 0, pageScroll: 0 };
let restore: Array<() => void> = [];

beforeEach(() => {
  Object.assign(layout, { row: ROW, listTop: 0, pageScroll: 0 });
  const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => VIEWPORT });
  const inner = window.innerHeight;
  window.innerHeight = VIEWPORT;
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const box = (top: number, tall: number) => ({ top, bottom: top + tall, left: 0, right: 0, x: 0, y: top, width: 0, height: tall, toJSON: () => ({}) });
    if (this.dataset.index !== undefined) return box(0, layout.row);
    // The list moves up as what scrolls it moves down.
    if (this.tagName === 'UL') return box(layout.listTop - (this.closest<HTMLElement>('[data-scroller]')?.scrollTop ?? layout.pageScroll), 0);
    return box(0, 0);
  });
  restore = [
    () => (height ? Object.defineProperty(HTMLElement.prototype, 'clientHeight', height) : delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight),
    () => { window.innerHeight = inner; },
    () => rect.mockRestore(),
  ];
});

afterEach(() => restore.forEach((undo) => undo()));

interface HarnessProps {
  count: number;
  keep?: number[];
  /** The page scrolls the list, not an element around it. */
  onPage?: boolean;
  onDraw?: (rows: WindowedRows) => void;
}

function Harness({ count, keep, onPage = false, onDraw }: HarnessProps) {
  const ref = useRef<HTMLUListElement>(null);
  const rows = useWindowedRows(ref, { count, keep });
  onDraw?.(rows);
  const list = (
    <ul ref={ref}>
      {rows.slots.map((slot) =>
        slot.kind === 'row'
          ? <li key={slot.index} data-index={slot.index}>Row {slot.index}</li>
          : <li key={slot.key} aria-hidden="true" data-gap={slot.rows} style={{ height: slot.height }} />
      )}
    </ul>
  );
  return onPage ? list : <div data-scroller="" style={{ overflowY: 'auto' }}>{list}</div>;
}

function setup(props: HarnessProps) {
  let latest: WindowedRows | undefined;
  const onDraw = vi.fn((rows: WindowedRows) => { latest = rows; });
  const utils = render(<Harness {...props} onDraw={onDraw} />);
  const scroller = utils.container.querySelector<HTMLElement>('[data-scroller]');
  const scrollTo = (top: number) => {
    if (scroller) {
      scroller.scrollTop = top;
      fireEvent.scroll(scroller);
    } else {
      layout.pageScroll = top;
      fireEvent.scroll(window);
    }
  };
  const drawn = () => Array.from(utils.container.querySelectorAll<HTMLElement>('[data-index]'), (row) => Number(row.dataset.index));
  const gaps = () => Array.from(utils.container.querySelectorAll<HTMLElement>('[data-gap]'), (gap) => parseFloat(gap.style.height));
  /** The height of everything in the list: what is drawn and what stands for the rest. */
  const height = () => drawn().length * layout.row + gaps().reduce((sum, gap) => sum + gap, 0);
  return { ...utils, onDraw, rows: () => latest!, scrollTo, drawn, gaps, height };
}

const range = (first: number, last: number) => Array.from({ length: last - first + 1 }, (_, i) => first + i);

describe('windowedSlots', () => {
  const tall = (rows: number) => rows * 10;

  it('draws the window with a gap on each side for the rows left out', () => {
    expect(windowedSlots(10, 3, 5, [], tall)).toEqual([
      { kind: 'gap', key: 'ps-windowed-gap-0', rows: 3, height: 30 },
      { kind: 'row', index: 3 }, { kind: 'row', index: 4 }, { kind: 'row', index: 5 },
      { kind: 'gap', key: 'ps-windowed-gap-4', rows: 4, height: 40 },
    ]);
  });

  it('has no gap where nothing is left out', () => {
    expect(windowedSlots(3, 0, 2, [], tall)).toEqual([{ kind: 'row', index: 0 }, { kind: 'row', index: 1 }, { kind: 'row', index: 2 }]);
    expect(windowedSlots(0, 0, -1, [], tall)).toEqual([]);
  });

  it('keeps a row outside the window drawn, in its place, between two gaps', () => {
    const kinds = (slots: ReturnType<typeof windowedSlots>) => slots.map((slot) => (slot.kind === 'row' ? slot.index : `gap ${slot.rows}`));
    expect(kinds(windowedSlots(20, 10, 12, [2], tall))).toEqual(['gap 2', 2, 'gap 7', 10, 11, 12, 'gap 7']);
    expect(kinds(windowedSlots(20, 10, 12, [19, 0], tall))).toEqual([0, 'gap 9', 10, 11, 12, 'gap 6', 19]);
    // Next to the window there is nothing between them; inside it, or outside the list, it changes nothing.
    expect(kinds(windowedSlots(20, 10, 12, [9, 13, 11, -1, 20, 2.5, Number.NaN], tall))).toEqual(['gap 9', 9, 10, 11, 12, 13, 'gap 6']);
  });

  it('makes no gaps while the height of a row is not known', () => {
    expect(windowedSlots(100, 0, 2, [50])).toEqual([{ kind: 'row', index: 0 }, { kind: 'row', index: 1 }, { kind: 'row', index: 2 }, { kind: 'row', index: 50 }]);
  });
});

describe('useWindowedRows', () => {
  it('draws every row of a list up to the threshold, and says it is not windowed', () => {
    const { rows, drawn, gaps } = setup({ count: 200 });
    expect(rows().windowed).toBe(false);
    expect(rows()).toMatchObject({ first: 0, last: 199, before: 0, after: 0 });
    expect(drawn()).toEqual(range(0, 199));
    expect(gaps()).toEqual([]);
  });

  it('draws the rows on screen with the overscan around them, and a gap for the rest', () => {
    const { rows, drawn, gaps, height } = setup({ count: 20_000 });
    // 500 px show rows 0 to 9. Seven more are drawn below, so that 6 rows of overscan are still
    // there when the scroll has reached the end of the first row.
    expect(rows()).toMatchObject({ windowed: true, first: 0, last: 10 + OVERSCAN, before: 0, after: (20_000 - 17) * ROW });
    expect(drawn()).toEqual(range(0, 16));
    expect(gaps()).toEqual([(20_000 - 17) * ROW]);
    expect(height()).toBe(20_000 * ROW);
  });

  it('follows the scroll, once per row and not at every scroll event', () => {
    const { onDraw, rows, scrollTo, drawn, height } = setup({ count: 20_000 });
    onDraw.mockClear();
    for (let top = 5; top < ROW; top += 5) scrollTo(top);
    expect(onDraw).not.toHaveBeenCalled();
    scrollTo(ROW + 1);
    expect(onDraw).toHaveBeenCalled();
    for (const top of [0, 120, 5_000, 4_990, 123_456, 999_500]) {
      scrollTo(top);
      const shown = drawn();
      // Every row the viewport touches is drawn, and never many more.
      expect(shown[0]).toBeLessThanOrEqual(Math.floor(top / ROW));
      expect(shown[shown.length - 1]).toBeGreaterThanOrEqual(Math.min(19_999, Math.ceil((top + VIEWPORT) / ROW) - 1));
      expect(shown.length).toBeLessThanOrEqual(10 + 2 * OVERSCAN + 2);
      expect(height()).toBe(20_000 * ROW);
      expect(rows().before).toBe(shown[0] * ROW);
    }
    scrollTo(5_000);
    expect(rows()).toMatchObject({ first: 100 - OVERSCAN, last: 110 + OVERSCAN });
  });

  it('holds the rows on screen when the scroll goes back before the list was drawn again', () => {
    const { scrollTo, drawn } = setup({ count: 20_000 });
    act(() => {
      scrollTo(100 * ROW + 5);
      scrollTo(100 * ROW - 5);
    });
    expect(drawn()).toContain(99);
    expect(drawn()).toContain(99 - OVERSCAN);
  });

  it('counts from where the list starts, for a list with something above it', () => {
    layout.listTop = 300;
    const { rows, scrollTo } = setup({ count: 20_000 });
    // The list's top is 300 px down: nothing has scrolled past it yet.
    scrollTo(250);
    expect(rows().first).toBe(0);
    scrollTo(300 + 100 * ROW);
    expect(rows()).toMatchObject({ first: 100 - OVERSCAN, last: 110 + OVERSCAN });
  });

  it('follows the page when no element around the list scrolls it', () => {
    const { rows, scrollTo, height } = setup({ count: 20_000, onPage: true });
    expect(rows()).toMatchObject({ first: 0, last: 10 + OVERSCAN });
    scrollTo(100 * ROW);
    expect(rows()).toMatchObject({ first: 100 - OVERSCAN, last: 110 + OVERSCAN });
    expect(height()).toBe(20_000 * ROW);
  });

  it('keeps the rows it is told to keep, with gaps that still add up', () => {
    const { rerender, onDraw, scrollTo, drawn, gaps, height } = setup({ count: 20_000, keep: [3] });
    scrollTo(100 * ROW);
    expect(drawn()).toEqual([3, ...range(94, 116)]);
    expect(gaps()).toEqual([3 * ROW, 90 * ROW, (20_000 - 117) * ROW]);
    expect(height()).toBe(20_000 * ROW);
    rerender(<Harness count={20_000} keep={[19_999, 3]} onDraw={onDraw} />);
    expect(drawn()).toEqual([3, ...range(94, 116), 19_999]);
    expect(height()).toBe(20_000 * ROW);
  });

  it('draws the rows of a much shorter list at once, not those of the old scroll position', () => {
    const { rerender, onDraw, scrollTo, drawn } = setup({ count: 20_000 });
    scrollTo(999_500);
    expect(drawn()).toContain(19_999);
    rerender(<Harness count={300} onDraw={onDraw} />);
    expect(drawn()).toContain(299);
    rerender(<Harness count={10} onDraw={onDraw} />);
    expect(drawn()).toEqual(range(0, 9));
  });

  it('measures again when a list grows past the threshold', () => {
    const { rerender, onDraw, rows, drawn } = setup({ count: 100 });
    expect(drawn()).toHaveLength(100);
    rerender(<Harness count={5_000} onDraw={onDraw} />);
    expect(rows()).toMatchObject({ windowed: true, first: 0, last: 10 + OVERSCAN });
  });

  it('draws a first batch of rows, with no gaps, where there is no layout', () => {
    layout.row = 0;
    const { rows, drawn, gaps, scrollTo } = setup({ count: 20_000, keep: [500] });
    expect(rows()).toMatchObject({ windowed: true, first: 0, last: 47, before: 0, after: 0 });
    expect(drawn()).toEqual([...range(0, 47), 500]);
    expect(gaps()).toEqual([]);
    // As soon as there is one, a scroll finds it.
    layout.row = ROW;
    scrollTo(100 * ROW);
    expect(rows()).toMatchObject({ first: 100 - OVERSCAN, last: 110 + OVERSCAN });
  });
});
