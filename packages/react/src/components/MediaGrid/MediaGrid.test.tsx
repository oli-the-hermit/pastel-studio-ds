import React, { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MediaTile } from '../MediaTile';
import { MediaGrid, type MediaGridProps } from './MediaGrid';

interface Item { id: string; name: string }
const items: Item[] = Array.from({ length: 6 }, (_, i) => ({ id: `m${i}`, name: `photo-${i}.png` }));

function setup(props: Partial<MediaGridProps<Item>> & { ref?: React.Ref<HTMLDivElement> } = {}) {
  const handlers = { onSelect: vi.fn(), onOpen: vi.fn(), onCommand: vi.fn(), onSelectAll: vi.fn(), onClearSelection: vi.fn(), onContextMenu: vi.fn() };
  const utils = render(
    <MediaGrid<Item>
      items={items}
      getKey={(item) => item.id}
      renderTile={(item, state) => <MediaTile name={item.name} selected={state.selected} selecting={state.selecting} />}
      selection={new Set()}
      label="Media in Pictures"
      {...handlers}
      {...props}
    />
  );
  return { ...utils, ...handlers };
}

const option = (name: string) => screen.getByRole('option', { name: new RegExp(name) });

describe('MediaGrid', () => {
  it('is a named listbox of options with their place in the whole list', () => {
    setup({ selection: new Set(['m1']) });
    expect(screen.getByRole('listbox', { name: 'Media in Pictures' }).getAttribute('aria-multiselectable')).toBe('true');
    const second = option('photo-1');
    expect(second.getAttribute('aria-selected')).toBe('true');
    expect(second.getAttribute('aria-posinset')).toBe('2');
    expect(second.getAttribute('aria-setsize')).toBe('6');
    expect(option('photo-0').tabIndex).toBe(0);
    expect(second.tabIndex).toBe(-1);
  });

  it('reports a click, Ctrl + click, Shift + click and a click on the check', () => {
    const { onSelect, container } = setup();
    fireEvent.click(option('photo-2'));
    fireEvent.click(option('photo-3'), { ctrlKey: true });
    fireEvent.click(option('photo-4'), { shiftKey: true });
    fireEvent.click(container.querySelectorAll('[data-media-check]')[5]);
    expect(onSelect.mock.calls).toEqual([['m2', 'replace'], ['m3', 'toggle'], ['m4', 'range'], ['m5', 'toggle']]);
  });

  it('opens on double-click and Enter, but not from the check', () => {
    const { onOpen, container } = setup();
    fireEvent.doubleClick(option('photo-1'));
    fireEvent.doubleClick(container.querySelectorAll('[data-media-check]')[2]);
    fireEvent.keyDown(option('photo-0'), { key: 'Enter' });
    expect(onOpen.mock.calls.map(([item]) => item.id)).toEqual(['m1', 'm0']);
  });

  it('moves with the arrows, selecting the tile reached, and extends with Shift', () => {
    const { onSelect } = setup();
    const list = screen.getByRole('listbox');
    fireEvent.keyDown(list, { key: 'ArrowRight' });
    fireEvent.keyDown(list, { key: 'ArrowRight', shiftKey: true });
    fireEvent.keyDown(list, { key: 'End' });
    fireEvent.keyDown(list, { key: 'Home', ctrlKey: true });
    expect(onSelect.mock.calls).toEqual([['m1', 'replace'], ['m2', 'range'], ['m5', 'replace']]);
    expect(option('photo-0').tabIndex).toBe(0);
  });

  it('sends commands and selection keys to the app, leaving Shift + Delete alone', () => {
    const { onCommand, onSelectAll, onClearSelection } = setup({ selection: new Set(['m0']) });
    const list = screen.getByRole('listbox');
    for (const init of [{ key: 'Delete' }, { key: 'F2' }, { key: 'c', ctrlKey: true }, { key: 'v', ctrlKey: true }, { key: 'Backspace' }, { key: 'ArrowLeft', altKey: true }, { key: 'Delete', shiftKey: true }]) {
      fireEvent.keyDown(list, init);
    }
    fireEvent.keyDown(list, { key: 'a', ctrlKey: true });
    fireEvent.keyDown(list, { key: 'Escape' });
    expect(onCommand.mock.calls.map(([c]) => c)).toEqual(['delete', 'rename', 'copy', 'paste', 'up', 'back']);
    expect(onSelectAll).toHaveBeenCalledTimes(1);
    expect(onClearSelection).toHaveBeenCalledTimes(1);
  });

  it('selects an unselected tile before its context menu, and reports the empty space as null', () => {
    const { onSelect, onContextMenu, container } = setup();
    fireEvent.contextMenu(option('photo-3'));
    expect(onSelect).toHaveBeenCalledWith('m3', 'replace');
    expect(onContextMenu.mock.calls[0][1].id).toBe('m3');
    fireEvent.contextMenu(container.firstElementChild!);
    expect(onContextMenu.mock.calls[1][1]).toBeNull();
  });

  it('passes extra attributes to each cell and shows a header, the size and its ref', () => {
    const ref = createRef<HTMLDivElement>();
    const onPointerEnter = vi.fn();
    const { container } = setup({ ref, size: 'xl', header: <p>Folders</p>, itemProps: (item) => ({ draggable: true, onPointerEnter: () => onPointerEnter(item.id) }) });
    expect(ref.current?.classList.contains('ps-media-grid--xl')).toBe(true);
    expect(screen.getByText('Folders').parentElement?.className).toBe('ps-media-grid-header');
    const cell = option('photo-2');
    expect(cell.getAttribute('draggable')).toBe('true');
    fireEvent.pointerEnter(cell);
    expect(onPointerEnter).toHaveBeenCalledWith('m2');
    expect(container.querySelectorAll('.ps-media-grid-cell')).toHaveLength(6);
  });

  it('opens on a plain click with openOnClick, while Ctrl, Shift and the check still select', () => {
    const { onSelect, onOpen, container } = setup({ openOnClick: true });
    fireEvent.click(option('photo-2'));
    fireEvent.click(option('photo-3'), { ctrlKey: true });
    fireEvent.click(option('photo-4'), { shiftKey: true });
    fireEvent.click(container.querySelectorAll('[data-media-check]')[5]);
    fireEvent.doubleClick(option('photo-1'));
    expect(onOpen.mock.calls.map(([item]) => item.id)).toEqual(['m2']);
    expect(onSelect.mock.calls).toEqual([['m3', 'toggle'], ['m4', 'range'], ['m5', 'toggle']]);
  });

  it('leaves clicks on a tile\'s own buttons to them', () => {
    const { onSelect, onOpen } = setup({
      openOnClick: true,
      renderTile: (item) => <MediaTile name={item.name} actions={<button type="button">Like {item.name}</button>} />,
    });
    fireEvent.click(screen.getByRole('button', { name: 'Like photo-0.png' }));
    expect(onSelect).not.toHaveBeenCalled();
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('takes a free tile width and square rows for overlay captions', () => {
    const ref = createRef<HTMLDivElement>();
    setup({ ref, tileWidth: 520, captions: 'overlay' });
    expect(ref.current?.style.getPropertyValue('--ps-media-grid-min')).toBe('520px');
    expect(ref.current?.classList.contains('ps-media-grid--overlay-captions')).toBe(true);
  });

  it('shows the empty state without items', () => {
    setup({ items: [], labels: { mediaEmpty: 'Nada por aquí.' } });
    expect(screen.getByText('Nada por aquí.')).toBeTruthy();
    setup({ items: [], empty: <p>Drop files to add them</p> });
    expect(screen.getByText('Drop files to add them')).toBeTruthy();
  });

  // A move or a delete takes tiles out while one of the last had the focus: the grid drew the
  // focused index of the longer list and read past the end of the shorter one.
  it('keeps drawing when tiles leave and the focused one was past the new end', () => {
    const { rerender, onSelect, onOpen, onCommand, onSelectAll, onClearSelection, onContextMenu } = setup();
    fireEvent.focus(option('photo-5'));
    expect(option('photo-5').tabIndex).toBe(0);
    const grid = (list: Item[]) => (
      <MediaGrid<Item>
        items={list}
        getKey={(item) => item.id}
        renderTile={(item) => <MediaTile name={item.name} />}
        selection={new Set()}
        label="Media in Pictures"
        {...{ onSelect, onOpen, onCommand, onSelectAll, onClearSelection, onContextMenu }}
      />
    );
    rerender(grid(items.slice(0, 2)));
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(option('photo-1').tabIndex).toBe(0);
    rerender(grid([]));
    expect(screen.queryAllByRole('option')).toHaveLength(0);
  });

  describe('when the list changes', () => {
    const others: Item[] = Array.from({ length: 6 }, (_, i) => ({ id: `n${i}`, name: `other-${i}.png` }));
    const handlers = () => ({ onSelect: vi.fn(), onOpen: vi.fn(), onCommand: vi.fn() });
    const grid = (list: Item[], h: ReturnType<typeof handlers>) => (
      <MediaGrid<Item>
        items={list}
        getKey={(item) => item.id}
        renderTile={(item) => <MediaTile name={item.name} />}
        selection={new Set()}
        label="Media in Pictures"
        {...h}
      />
    );
    const tabStop = () => screen.getAllByRole('option').filter((o) => o.tabIndex === 0);

    it('starts at the first tile of another folder, not at the place it had in the last one', () => {
      const h = handlers();
      const { rerender } = render(grid(items, h));
      fireEvent.click(option('photo-5'));
      rerender(grid(others, h));
      expect(tabStop()).toEqual([option('other-0')]);
      fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Enter' });
      expect(h.onOpen.mock.calls.map(([item]) => item.id)).toEqual(['n0']);
      // A folder that loads empty first, then fills.
      fireEvent.click(option('other-4'));
      rerender(grid([], h));
      rerender(grid(items.slice(0, 5), h));
      expect(tabStop()).toEqual([option('photo-0')]);
    });

    it('keeps the focus on the same file when tiles come, go or move above it', () => {
      const h = handlers();
      const { rerender } = render(grid(items, h));
      fireEvent.click(option('photo-2'));
      h.onSelect.mockClear();
      const list = () => screen.getByRole('listbox');
      rerender(grid([{ id: 'new', name: 'new.png' }, ...items], h));
      fireEvent.keyDown(list(), { key: 'Enter' });
      rerender(grid(items.filter((item) => item.id !== 'm0' && item.id !== 'm1'), h));
      fireEvent.keyDown(list(), { key: ' ' });
      rerender(grid([...items].reverse(), h));
      fireEvent.keyDown(list(), { key: 'Enter' });
      expect(h.onOpen.mock.calls.map(([item]) => item.id)).toEqual(['m2', 'm2']);
      expect(h.onSelect.mock.calls).toEqual([['m2', 'replace']]);
      expect(tabStop()).toEqual([option('photo-2')]);
      // The arrows go on from where that file is now.
      fireEvent.keyDown(list(), { key: 'ArrowRight' });
      expect(h.onSelect).toHaveBeenLastCalledWith('m1', 'replace');
    });

    it('moves the focus to the tile now in the place of one that left, and keeps it in the grid', () => {
      const h = handlers();
      const { rerender } = render(grid(items, h));
      option('photo-2').focus();
      rerender(grid(items.filter((item) => item.id !== 'm2'), h));
      expect(document.activeElement).toBe(option('photo-3'));
      option('photo-5').focus();
      rerender(grid(items.slice(0, 4), h));
      expect(document.activeElement).toBe(option('photo-3'));
      fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
      expect(h.onOpen.mock.calls.map(([item]) => item.id)).toEqual(['m3']);
      // Enter on a folder: another list.
      rerender(grid(others, h));
      expect(document.activeElement).toBe(option('other-0'));
      rerender(grid([], h));
      expect(document.activeElement).toBe(screen.getByRole('listbox'));
    });

    it('leaves the focus alone when it was somewhere else', async () => {
      const h = handlers();
      const page = (list: Item[]) => <>{grid(list, h)}<button type="button">Elsewhere</button></>;
      const { rerender } = render(page(items));
      option('photo-2').focus();
      screen.getByRole('button', { name: 'Elsewhere' }).focus();
      await act(async () => {});
      rerender(page(items.filter((item) => item.id !== 'm2')));
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Elsewhere' }));
      option('photo-3').focus();
      (document.activeElement as HTMLElement).blur();
      await act(async () => {});
      rerender(page(items.filter((item) => item.id !== 'm2' && item.id !== 'm3')));
      expect(document.activeElement).toBe(document.body);
    });
  });
});
