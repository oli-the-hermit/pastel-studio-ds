import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MediaGrid } from './MediaGrid';

// jsdom has no layout: every size is 0, and the grid then draws its first tiles unvirtualized.
// These tests give it a box of 1000 x 800 px, so it draws the rows on screen as a browser does.
// With the tokens' fallback sizes (tiles of at least 200 px, 16 px apart, 44 px of caption) that
// is 4 columns, rows 282 px tall and 298 px from one row's top to the next.
const WIDTH = 1000;
const VIEWPORT = 800;
const COLUMNS = 4;
const STRIDE = 298;

interface Item { id: string }
const items: Item[] = Array.from({ length: 50_000 }, (_, i) => ({ id: `m${i}` }));

const sizes: Array<[string, number]> = [['clientWidth', WIDTH], ['clientHeight', VIEWPORT]];
let restore: Array<() => void> = [];

beforeEach(() => {
  restore = sizes.map(([name, value]) => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, name);
    Object.defineProperty(HTMLElement.prototype, name, { configurable: true, get: () => value });
    return () => (original ? Object.defineProperty(HTMLElement.prototype, name, original) : delete (HTMLElement.prototype as unknown as Record<string, unknown>)[name]);
  });
});

afterEach(() => restore.forEach((undo) => undo()));

function setup(props: Partial<React.ComponentProps<typeof MediaGrid<Item>>> = {}) {
  const renderTile = vi.fn((item: Item) => <span>{item.id}</span>);
  const utils = render(
    <MediaGrid<Item> items={items} getKey={(item) => item.id} renderTile={renderTile} selection={new Set()} onSelect={() => {}} onOpen={() => {}} label="Media" {...props} />
  );
  const grid = utils.container.firstElementChild as HTMLElement;
  const scrollTo = (top: number) => {
    grid.scrollTop = top;
    fireEvent.scroll(grid);
  };
  const drawn = () => Array.from(utils.container.querySelectorAll<HTMLElement>('[data-index]'), (cell) => Number(cell.dataset.index)).sort((a, b) => a - b);
  return { ...utils, grid, renderTile, scrollTo, drawn };
}

/** The tiles a viewport `top` px down must show: every row it touches. */
const onScreen = (top: number) => {
  const first = Math.floor(top / STRIDE) * COLUMNS;
  const last = Math.min(items.length, Math.ceil((top + VIEWPORT) / STRIDE) * COLUMNS) - 1;
  return { first, last };
};

describe('MediaGrid, scrolling', () => {
  it('draws the rows on screen, with the rows of overscan around them', () => {
    const { drawn } = setup();
    // 800 px show rows 0 to 2. Four more are drawn below, so that 3 rows of overscan are still
    // there when the scroll has reached the end of the first row
    expect(drawn()).toEqual(Array.from({ length: 7 * COLUMNS }, (_, i) => i));
  });

  it('does not draw again while the scroll stays within a row', () => {
    const { renderTile, scrollTo } = setup();
    renderTile.mockClear();
    for (let top = 10; top < STRIDE; top += 10) scrollTo(top);
    expect(renderTile).not.toHaveBeenCalled();
  });

  it('draws again when a row comes into view, and always holds the tiles on screen', () => {
    const { renderTile, scrollTo, drawn } = setup();
    renderTile.mockClear();
    scrollTo(STRIDE + 1);
    expect(renderTile).toHaveBeenCalled();
    for (const top of [0, 150, 299, 5_000, 4_990, 123_456, 123_400, 1_000_000, 3_724_000]) {
      scrollTo(top);
      const shown = drawn();
      const { first, last } = onScreen(top);
      expect(shown[0]).toBeLessThanOrEqual(first);
      expect(shown[shown.length - 1]).toBeGreaterThanOrEqual(last);
      // Only the rows around the viewport (and the tile with the focus), never the whole list
      expect(shown.length).toBeLessThanOrEqual(11 * COLUMNS + 1);
    }
  });

  it('holds the tiles on screen when the scroll goes back before the grid was drawn again', () => {
    const { scrollTo, drawn } = setup();
    // Two scroll events in one go, as when the browser sends them faster than React draws
    act(() => {
      scrollTo(10 * STRIDE + 5);
      scrollTo(10 * STRIDE - 5);
    });
    const shown = drawn();
    const { first, last } = onScreen(10 * STRIDE - 5);
    expect(shown[0]).toBeLessThanOrEqual(first);
    expect(shown[shown.length - 1]).toBeGreaterThanOrEqual(last);
    expect(shown).toContain((10 - 1 - 3) * COLUMNS);
  });

  it('asks for the next page once, when the last rows come into view', () => {
    const onEndReached = vi.fn();
    const few = items.slice(0, 200);
    const { scrollTo } = setup({ items: few, onEndReached });
    expect(onEndReached).not.toHaveBeenCalled();
    scrollTo(50 * STRIDE - VIEWPORT);
    scrollTo(50 * STRIDE - VIEWPORT + 3);
    expect(onEndReached).toHaveBeenCalledTimes(1);
  });

  it('brings the tile the arrows reach into view', () => {
    const { grid, drawn } = setup();
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'End' });
    expect(grid.scrollTop).toBeGreaterThan(3_000_000);
    expect(drawn()).toContain(items.length - 1);
    expect(document.activeElement?.getAttribute('data-index')).toBe(String(items.length - 1));
  });
});
