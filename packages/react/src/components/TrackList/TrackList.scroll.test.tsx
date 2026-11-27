import React, { useState } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Track } from '../../lib/types';
import { moveById } from '../SortableList';
import { TrackList } from './TrackList';

// jsdom has no layout: every size is 0, and a long list then draws its first rows with no gaps
// (see TrackList.test.tsx). These tests give it rows of 56 px in a scroller 560 px tall, so it
// draws the rows on screen as a browser does: 10 on screen, and 6 more on each side.
const ROW = 56;
const VIEWPORT = 560;
const COUNT = 20_000;

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
    // The list moves up as what scrolls it moves down.
    if (this.tagName === 'OL') return box(-(this.closest<HTMLElement>('[data-scroller]')?.scrollTop ?? 0), 0);
    return box(0, 0);
  });
  restore = [
    () => (height ? Object.defineProperty(HTMLElement.prototype, 'clientHeight', height) : delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight),
    () => rect.mockRestore(),
  ];
});

afterEach(() => restore.forEach((undo) => undo()));

/** A page that scrolls the list, as an app's main area does. */
function Page(props: Partial<React.ComponentProps<typeof TrackList>>) {
  return (
    <div data-scroller="" style={{ overflowY: 'auto' }}>
      <TrackList ariaLabel="All songs" tracks={tracks} onPlay={noop} {...props} />
    </div>
  );
}

function setup(props: Partial<React.ComponentProps<typeof TrackList>> = {}, ui: React.ReactElement = <Page {...props} />) {
  const utils = render(ui);
  const scroller = utils.container.querySelector<HTMLElement>('[data-scroller]')!;
  const scrollTo = (top: number) => {
    scroller.scrollTop = top;
    fireEvent.scroll(scroller);
  };
  const list = () => screen.getByRole('list', { name: 'All songs' });
  const rows = () => within(list()).getAllByRole('listitem');
  const drawn = () => rows().map((row) => Number(row.dataset.index));
  const gaps = () => Array.from(list().querySelectorAll<HTMLElement>('.ps-track-list-gap'), (gap) => parseFloat(gap.style.height));
  /** The height of everything in the list: the rows drawn and the gaps that stand for the rest. */
  const height = () => rows().length * ROW + gaps().reduce((sum, gap) => sum + gap, 0);
  const row = (index: number) => list().querySelector<HTMLElement>(`[data-index="${index}"]`);
  return { ...utils, scrollTo, list, rows, drawn, gaps, height, row };
}

const range = (first: number, last: number) => Array.from({ length: last - first + 1 }, (_, i) => first + i);
const frame = () => act(() => new Promise<void>((done) => requestAnimationFrame(() => done())));

describe('TrackList, a long list', () => {
  it('draws only the rows near the screen, and stands for the rest with a gap of their height', () => {
    const { list, drawn, gaps, height } = setup();
    expect(drawn()).toEqual(range(0, 16));
    expect(gaps()).toEqual([(COUNT - 17) * ROW]);
    expect(height()).toBe(COUNT * ROW);
    // The gap is not a row: assistive technology does not see it.
    const gap = list().querySelector('.ps-track-list-gap')!;
    expect(gap.tagName).toBe('LI');
    expect(gap.getAttribute('aria-hidden')).toBe('true');
    expect(list().children).toHaveLength(18);
  });

  it('tells each row its place in the whole list', () => {
    const { row, scrollTo } = setup();
    scrollTo(1_000 * ROW);
    const shown = row(1_000)!;
    expect(shown.getAttribute('aria-posinset')).toBe('1001');
    expect(shown.getAttribute('aria-setsize')).toBe(String(COUNT));
    expect(shown.getAttribute('aria-label')).toBe('Song 1001, Glass Harbor, 3:20');
    expect(shown.querySelector('.ps-track-list-num-text')?.textContent).toBe('1001');
  });

  it('draws other rows as it scrolls, never many, and keeps the height of the whole list', () => {
    const { scrollTo, drawn, height } = setup();
    for (const top of [0, 150, 5_000, 4_990, 123_456, 600_000, COUNT * ROW - VIEWPORT]) {
      scrollTo(top);
      const shown = drawn();
      // Every row the viewport touches is drawn.
      expect(shown[0]).toBeLessThanOrEqual(Math.floor(top / ROW));
      expect(shown[shown.length - 1]).toBeGreaterThanOrEqual(Math.min(COUNT - 1, Math.ceil((top + VIEWPORT) / ROW) - 1));
      expect(shown.length).toBeLessThanOrEqual(24);
      expect(height()).toBe(COUNT * ROW);
    }
    expect(drawn()).toContain(COUNT - 1);
  });

  it('keeps the row with the focus drawn while it is scrolled away', () => {
    const { row, scrollTo, drawn, gaps, height } = setup();
    const focused = row(3)!;
    focused.focus();
    scrollTo(1_000 * ROW);
    expect(drawn()).toEqual([3, ...range(994, 1_016)]);
    expect(row(3)).toBe(focused);
    expect(document.activeElement).toBe(focused);
    expect(gaps()).toEqual([3 * ROW, 990 * ROW, (COUNT - 1_017) * ROW]);
    expect(height()).toBe(COUNT * ROW);
    // The focus moves on: the old row is let go, the new one kept.
    row(1_000)!.focus();
    scrollTo(0);
    expect(drawn()).toEqual([...range(0, 16), 1_000]);
  });

  it('keeps the row whose tool has the focus, not only a focused row', () => {
    const { row, scrollTo, drawn } = setup({ onLikedChange: noop });
    const heart = within(row(2)!).getByRole('button', { name: 'Add to Liked' });
    heart.focus();
    scrollTo(1_000 * ROW);
    expect(drawn()).toContain(2);
    expect(document.activeElement).toBe(heart);
  });

  it('plays, marks the current track and opens a row menu as a short list does', async () => {
    const onPlay = vi.fn();
    const user = userEvent.setup();
    const { row, scrollTo } = setup({ onPlay, currentId: 't1002', playing: true, rowActions: () => [{ key: 'q', label: 'Add to queue', onSelect: noop }] });
    scrollTo(1_000 * ROW);
    expect(row(1_002)!.getAttribute('aria-current')).toBe('true');
    expect(row(1_002)!.className).toContain('is-current');
    row(1_000)!.focus();
    await user.keyboard('{Enter}');
    await user.dblClick(row(1_001)!);
    expect(onPlay.mock.calls.map(([played]) => played.id)).toEqual(['t1000', 't1001']);
    await user.click(screen.getByRole('button', { name: 'More actions for Song 1004' }));
    expect(screen.getByRole('menuitem', { name: 'Add to queue' })).toBeTruthy();
  });

  it('moves a row with Alt + arrows, which keeps the focus and says where it went', async () => {
    const user = userEvent.setup();
    function Playlist() {
      const [list, setList] = useState(tracks);
      return <Page tracks={list} onReorder={(a, b) => setList((l) => moveById(l, a, b) ?? l)} />;
    }
    const { row, scrollTo, drawn } = setup({}, <Playlist />);
    scrollTo(1_000 * ROW);
    const moved = row(1_005)!;
    moved.focus();
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await frame();
    expect(row(1_006)).toBe(moved);
    expect(moved.getAttribute('aria-label')).toBe('Song 1006, Glass Harbor, 3:20');
    expect(row(1_005)!.getAttribute('aria-label')).toBe('Song 1007, Glass Harbor, 3:20');
    expect(document.activeElement).toBe(moved);
    expect(screen.getByRole('status').textContent).toBe(`Moved to position 1007 of ${COUNT}`);
    // Moved past the rows that are drawn, it is still there and still has the focus.
    for (let i = 0; i < 12; i++) {
      await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
      await frame();
    }
    expect(row(1_018)).toBe(moved);
    expect(drawn()).toEqual([...range(994, 1_016), 1_018]);
    expect(document.activeElement).toBe(moved);
  });

  it('drops a dragged row onto another drawn row, and keeps the dragged row while the list scrolls under it', () => {
    const onReorder = vi.fn();
    const { row, scrollTo, drawn } = setup({ onReorder });
    const dataTransfer = { setData: vi.fn(), effectAllowed: '', dropEffect: '' };
    const dragged = row(2)!;
    fireEvent.dragStart(dragged, { dataTransfer });
    fireEvent.dragOver(row(5)!, { dataTransfer });
    expect(dragged.className).toContain('is-dragging');
    expect(row(5)!.className).toContain('is-drag-over');
    // The page scrolls while the row is held: it stays in the page, so the drag can end.
    scrollTo(1_000 * ROW);
    expect(drawn()).toEqual([2, ...range(994, 1_016)]);
    expect(row(2)).toBe(dragged);
    fireEvent.dragOver(row(1_003)!, { dataTransfer });
    fireEvent.drop(row(1_003)!, { dataTransfer });
    expect(onReorder).toHaveBeenCalledWith('t2', 't1003');
    // Once dropped it is let go.
    expect(drawn()).toEqual(range(994, 1_016));
  });

  it('draws every row of a list of 50, or of 200, with nothing added to them', () => {
    const { rerender, list, rows, gaps } = setup({ tracks: tracks.slice(0, 50) });
    expect(rows()).toHaveLength(50);
    expect(gaps()).toEqual([]);
    expect(list().children).toHaveLength(50);
    expect(rows()[10].getAttributeNames().sort()).toEqual(['aria-label', 'class', 'tabindex']);
    rerender(<Page tracks={tracks.slice(0, 200)} />);
    expect(rows()).toHaveLength(200);
    expect(gaps()).toEqual([]);
    rerender(<Page tracks={tracks.slice(0, 201)} />);
    expect(rows().length).toBeLessThan(30);
    expect(rows()[0].getAttribute('aria-setsize')).toBe('201');
  });
});
