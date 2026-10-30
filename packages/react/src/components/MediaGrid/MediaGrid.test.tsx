import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

  it('shows the empty state without items', () => {
    setup({ items: [], labels: { mediaEmpty: 'Nada por aquí.' } });
    expect(screen.getByText('Nada por aquí.')).toBeTruthy();
    setup({ items: [], empty: <p>Drop files to add them</p> });
    expect(screen.getByText('Drop files to add them')).toBeTruthy();
  });
});
