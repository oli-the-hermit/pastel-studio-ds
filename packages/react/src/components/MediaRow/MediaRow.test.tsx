import React, { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TitleTile } from '../TitleTile';
import { MediaRow } from './MediaRow';

const names = (count: number) => Array.from({ length: count }, (_, i) => `Film ${i + 1}`);
const tiles = (count: number) => names(count).map((name) => <TitleTile key={name} title={name} />);
const list = () => screen.getByRole('list') as HTMLUListElement;
const item = (n: number) => screen.getByRole('button', { name: `Film ${n}` });
const tabStops = () => screen.getAllByRole('listitem').map((cell) => (cell.firstElementChild as HTMLElement).tabIndex);
const arrow = (name: string) => screen.queryByRole('button', { name }) as HTMLButtonElement | null;

/**
 * jsdom lays nothing out: gives the row a width and its items their places (160 wide, 16 apart,
 * 4 in from the list's edge), and makes scrolling move it and tell the row.
 */
function layOut(width: number) {
  const el = list();
  const cells = Array.from(el.children) as HTMLElement[];
  let scrollLeft = 0;
  cells.forEach((cell, i) => {
    Object.defineProperty(cell, 'offsetLeft', { configurable: true, value: 4 + i * 176 });
    Object.defineProperty(cell, 'offsetWidth', { configurable: true, value: 160 });
  });
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: width });
  Object.defineProperty(el, 'scrollWidth', { configurable: true, value: Math.max(width, cells.length * 176 - 16 + 8) });
  Object.defineProperty(el, 'scrollLeft', { configurable: true, get: () => scrollLeft, set: (v: number) => { scrollLeft = v; } });
  el.scrollTo = vi.fn((options?: ScrollToOptions | number) => {
    scrollLeft = typeof options === 'object' ? options.left ?? 0 : 0;
    fireEvent.scroll(el);
  }) as unknown as typeof el.scrollTo;
  act(() => { fireEvent.scroll(el); });
  return el;
}

describe('MediaRow', () => {
  it('is a region named by its heading, with its items in a list', () => {
    render(<MediaRow title="Continue watching">{tiles(3)}</MediaRow>);
    const region = screen.getByRole('region', { name: 'Continue watching' });
    expect(region.className).toBe('ps-media-row');
    expect(screen.getByRole('heading', { level: 2, name: 'Continue watching' }).className).toBe('ps-media-row-title');
    expect(list().className).toBe('ps-media-row-list');
    const cells = screen.getAllByRole('listitem');
    expect(cells).toHaveLength(3);
    expect(cells.map((cell) => cell.firstElementChild)).toEqual([item(1), item(2), item(3)]);
  });

  it('takes the heading level it is given', () => {
    render(<MediaRow title="Recently added" headingLevel={3}>{tiles(1)}</MediaRow>);
    expect(screen.getByRole('heading', { level: 3, name: 'Recently added' })).toBeTruthy();
  });

  it('shows See all only with onSeeAll, read with the row it belongs to', async () => {
    const onSeeAll = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<MediaRow title="Albums">{tiles(2)}</MediaRow>);
    expect(arrow('See all')).toBeNull();
    rerender(<MediaRow title="Albums" onSeeAll={onSeeAll}>{tiles(2)}</MediaRow>);
    const seeAll = arrow('See all')!;
    expect(document.getElementById(seeAll.getAttribute('aria-describedby')!)?.textContent).toBe('Albums');
    await user.click(seeAll);
    expect(onSeeAll).toHaveBeenCalledTimes(1);
    rerender(<MediaRow title="Albums" onSeeAll={onSeeAll} labels={{ seeAll: 'Ver todo' }}>{tiles(2)}</MediaRow>);
    expect(arrow('Ver todo')).toBeTruthy();
  });

  it('hides the arrows when everything fits', () => {
    render(<MediaRow title="Albums">{tiles(3)}</MediaRow>);
    expect(arrow('Previous')).toBeNull();
    layOut(700);
    expect(arrow('Previous')).toBeNull();
    expect(arrow('Next')).toBeNull();
  });

  it('scrolls about a page with the arrows, which are disabled at the ends', async () => {
    const user = userEvent.setup();
    render(<MediaRow title="Films">{tiles(12)}</MediaRow>);
    const el = layOut(700);
    expect(arrow('Previous')!.disabled).toBe(true);
    expect(arrow('Next')!.disabled).toBe(false);
    expect(arrow('Next')!.getAttribute('aria-controls')).toBe(el.id);

    // Four items fit; the fifth, cut off by the edge, comes first.
    await user.click(arrow('Next')!);
    expect(el.scrollLeft).toBe(704);
    expect(arrow('Previous')!.disabled).toBe(false);
    expect(arrow('Next')!.disabled).toBe(false);

    await user.click(arrow('Next')!);
    expect(el.scrollLeft).toBe(1404);
    expect(arrow('Next')!.disabled).toBe(true);

    await user.click(arrow('Previous')!);
    expect(el.scrollLeft).toBe(704);
    await user.click(arrow('Previous')!);
    expect(el.scrollLeft).toBe(0);
    expect(arrow('Previous')!.disabled).toBe(true);
    expect(arrow('Next')!.disabled).toBe(false);
  });

  it('hands the focus to the other arrow when the one pressed is disabled at the end', async () => {
    const user = userEvent.setup();
    render(<MediaRow title="Films">{tiles(6)}</MediaRow>);
    layOut(700);
    arrow('Next')!.focus();
    await user.keyboard('{Enter}');
    expect(arrow('Next')!.disabled).toBe(true);
    expect(document.activeElement).toBe(arrow('Previous'));
    await user.keyboard('{Enter}');
    expect(arrow('Previous')!.disabled).toBe(true);
    expect(document.activeElement).toBe(arrow('Next'));
  });

  it('shows the arrows again when items come and the row no longer fits', () => {
    const { rerender } = render(<MediaRow title="Films">{tiles(3)}</MediaRow>);
    layOut(700);
    expect(arrow('Next')).toBeNull();
    rerender(<MediaRow title="Films">{tiles(9)}</MediaRow>);
    layOut(700);
    expect(arrow('Next')).toBeTruthy();
  });

  it('has one tab stop, moved by the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    render(<MediaRow title="Films">{tiles(4)}</MediaRow>);
    const intoView = vi.fn();
    for (const cell of screen.getAllByRole('listitem')) cell.scrollIntoView = intoView;
    expect(tabStops()).toEqual([0, -1, -1, -1]);

    await user.tab();
    expect(document.activeElement).toBe(item(1));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(item(2));
    expect(tabStops()).toEqual([-1, 0, -1, -1]);
    expect(intoView).toHaveBeenLastCalledWith({ block: 'nearest', inline: 'nearest' });
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(item(4));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(item(4));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(item(3));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(item(1));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(item(1));
    expect(tabStops()).toEqual([0, -1, -1, -1]);
    expect(intoView).toHaveBeenCalledTimes(4);

    // Tab leaves the row instead of going through its items.
    await user.tab();
    expect(document.activeElement).toBe(document.body);
  });

  it('gives the tab stop to the item that was clicked, and to the last one when items leave', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MediaRow title="Films">{tiles(4)}</MediaRow>);
    await user.click(item(4));
    expect(tabStops()).toEqual([-1, -1, -1, 0]);
    rerender(<MediaRow title="Films">{tiles(2)}</MediaRow>);
    expect(tabStops()).toEqual([-1, 0]);
  });

  it('leaves the arrow keys to what is inside an item', async () => {
    const user = userEvent.setup();
    render(
      <MediaRow title="Notes">
        <div><input aria-label="Note" defaultValue="abc" /></div>
        <button type="button">Other</button>
      </MediaRow>
    );
    screen.getByRole('textbox').focus();
    await user.keyboard('{ArrowRight}{End}');
    expect(document.activeElement).toBe(screen.getByRole('textbox'));
  });

  it('forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLElement>();
    render(<MediaRow ref={ref} title="Films" className="mine" data-id="7">{tiles(1)}</MediaRow>);
    expect(ref.current).toBe(screen.getByRole('region'));
    expect(ref.current?.className).toBe('ps-media-row mine');
    expect(ref.current?.dataset.id).toBe('7');
  });
});
