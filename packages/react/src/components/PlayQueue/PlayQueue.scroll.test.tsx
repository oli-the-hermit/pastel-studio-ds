import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Track } from '../../lib/types';
import { PlayQueue } from './PlayQueue';

// jsdom has no layout and no stylesheet. These tests give the queue rows of 56 px, 6 px apart, in
// a body 620 px tall that scrolls, as the card's stylesheet does in a browser: 10 rows on
// screen, and 6 more drawn on each side.
const ROW = 56;
const GAP = 6;
const STRIDE = ROW + GAP;
const VIEWPORT = 620;
const COUNT = 5_000;

const track = (i: number): Track => ({ id: `t${i}`, title: `Song ${i + 1}`, artist: 'Glass Harbor', duration: 200 });
const tracks: Track[] = Array.from({ length: COUNT }, (_, i) => track(i));
const noop = () => {};

let restore: Array<() => void> = [];

beforeEach(() => {
  const height = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientHeight');
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => VIEWPORT });
  const rect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
    const box = (top: number, tall: number) => ({ top, bottom: top + tall, left: 0, right: 0, x: 0, y: top, width: 0, height: tall, toJSON: () => ({}) });
    if (this.dataset.index !== undefined) return box(0, ROW);
    // The list moves up as the card's body scrolls down.
    if (this.tagName === 'OL') return box(-(this.closest<HTMLElement>('.ps-play-queue-body')?.scrollTop ?? 0), 0);
    return box(0, 0);
  });
  // What the stylesheet would say: the body scrolls, and the rows are 6 px apart.
  const computed = window.getComputedStyle.bind(window);
  const style = vi.spyOn(window, 'getComputedStyle').mockImplementation((element: Element, pseudo?: string | null) => {
    const real = computed(element, pseudo);
    const said = element.classList.contains('ps-play-queue-body') ? { overflowY: 'auto' } : element.classList.contains('ps-play-queue-list') ? { rowGap: `${GAP}px` } : null;
    if (!said) return real;
    return new Proxy(real, {
      get: (target, name) => {
        if (name in said) return said[name as keyof typeof said];
        const value = Reflect.get(target, name);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
  });
  restore = [
    () => (height ? Object.defineProperty(HTMLElement.prototype, 'clientHeight', height) : delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight),
    () => rect.mockRestore(),
    () => style.mockRestore(),
  ];
});

afterEach(() => restore.forEach((undo) => undo()));

function setup(props: Partial<React.ComponentProps<typeof PlayQueue>> = {}) {
  const utils = render(<PlayQueue upNext={tracks} onPlay={noop} {...props} />);
  const body = utils.container.querySelector<HTMLElement>('.ps-play-queue-body')!;
  const scrollTo = (top: number) => {
    body.scrollTop = top;
    fireEvent.scroll(body);
  };
  const list = () => body.querySelector<HTMLElement>('ol.ps-play-queue-list')!;
  const rows = () => within(list()).getAllByRole('listitem');
  const drawn = () => rows().map((row) => Number(row.dataset.index));
  const gaps = () => Array.from(list().querySelectorAll<HTMLElement>('.ps-play-queue-gap'), (gap) => parseFloat(gap.style.height));
  /** The height of everything in the list: rows, the gaps that stand for the rest, and the space between them all. */
  const height = () => rows().length * ROW + gaps().reduce((sum, gap) => sum + gap, 0) + (list().children.length - 1) * GAP;
  const row = (index: number) => list().querySelector<HTMLElement>(`[data-index="${index}"]`);
  return { ...utils, scrollTo, list, rows, drawn, gaps, height, row };
}

const range = (first: number, last: number) => Array.from({ length: last - first + 1 }, (_, i) => first + i);

describe('PlayQueue, a long queue', () => {
  it('draws only the rows near the screen as its body scrolls, and keeps the height of the whole list', () => {
    const { scrollTo, drawn, gaps, height, list } = setup();
    expect(drawn()).toEqual(range(0, 16));
    expect(gaps()).toEqual([(COUNT - 17) * STRIDE - GAP]);
    expect(list().querySelector('.ps-play-queue-gap')?.getAttribute('aria-hidden')).toBe('true');
    const whole = COUNT * STRIDE - GAP;
    expect(height()).toBe(whole);
    for (const top of [100, 1_000 * STRIDE, 1_000 * STRIDE - 10, 200_000, whole - VIEWPORT]) {
      scrollTo(top);
      const shown = drawn();
      expect(shown[0]).toBeLessThanOrEqual(Math.floor(top / STRIDE));
      expect(shown[shown.length - 1]).toBeGreaterThanOrEqual(Math.min(COUNT - 1, Math.ceil((top + VIEWPORT) / STRIDE) - 1));
      expect(shown.length).toBeLessThanOrEqual(24);
      expect(height()).toBe(whole);
    }
    expect(drawn()).toContain(COUNT - 1);
  });

  it('tells each row its place, and plays, removes and moves it as in a short queue', async () => {
    const onPlay = vi.fn();
    const onRemove = vi.fn();
    const onReorder = vi.fn();
    const user = userEvent.setup();
    const { scrollTo, row } = setup({ onPlay, onRemove, onReorder });
    scrollTo(1_000 * STRIDE);
    const shown = row(1_000)!;
    expect(shown.getAttribute('aria-posinset')).toBe('1001');
    expect(shown.getAttribute('aria-setsize')).toBe(String(COUNT));
    await user.click(shown);
    expect(onPlay).toHaveBeenCalledWith(tracks[1_000], 'next');
    await user.click(screen.getByRole('button', { name: 'Remove from queue: Song 1002' }));
    expect(onRemove).toHaveBeenCalledWith(tracks[1_001]);
    shown.focus();
    await user.keyboard('{Alt>}{ArrowUp}{/Alt}');
    expect(onReorder).toHaveBeenCalledWith('t1000', 't999');
    expect(screen.getByRole('status').textContent).toBe(`Moved to position 1000 of ${COUNT}`);
  });

  it('keeps the row with the focus drawn while it is scrolled away', () => {
    const { scrollTo, drawn, row, height } = setup();
    const focused = row(4)!;
    focused.focus();
    scrollTo(1_000 * STRIDE);
    expect(drawn()).toEqual([4, ...range(994, 1_016)]);
    expect(row(4)).toBe(focused);
    expect(document.activeElement).toBe(focused);
    expect(height()).toBe(COUNT * STRIDE - GAP);
  });

  it('draws a long history the same way, where a track can come twice', () => {
    const history = [...tracks.slice(0, 300), ...tracks.slice(0, 300)];
    const { scrollTo, drawn, rows } = setup({ upNext: [], history, tab: 'history' });
    expect(screen.getByRole('list', { name: 'History' })).toBeTruthy();
    expect(drawn()).toEqual(range(0, 16));
    scrollTo(300 * STRIDE);
    expect(drawn()).toEqual(range(294, 316));
    expect(rows()[6].getAttribute('aria-posinset')).toBe('301');
    // The 301st row is the first song again.
    expect(rows()[6].querySelector('.ps-track-info-title')?.textContent).toBe('Song 1');
  });

  it('draws every row of a queue of 50, with nothing added to them', () => {
    const { rows, gaps, list } = setup({ upNext: tracks.slice(0, 50) });
    expect(rows()).toHaveLength(50);
    expect(gaps()).toEqual([]);
    expect(list().children).toHaveLength(50);
    expect(rows()[10].getAttributeNames().sort()).toEqual(['class', 'tabindex']);
  });
});
