import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FsEntry } from '../../lib/fs';
import { FileView, type FileViewProps } from './FileView';

const items: FsEntry[] = [
  { id: 'albums', name: 'Albums', kind: 'folder', children: [] },
  { id: 'cover', name: 'Cover.png', kind: 'file', size: 2048 },
  { id: 'notes', name: 'Notes.txt', kind: 'file', size: 10 },
  { id: 'd', name: 'Media (D:)', kind: 'drive', capacity: 100, free: 5 },
];
const option = (name: RegExp) => screen.getByRole('option', { name });
const flush = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
const view = (props: Partial<FileViewProps> = {}) => {
  const p = { onSelect: vi.fn(), onOpen: vi.fn(), onCommand: vi.fn(), ...props };
  render(<FileView label="Files in Music" items={items} view="details" selection={new Set()} {...p} />);
  return p;
};

describe('FileView', () => {
  it('is a multi-select listbox with typed rows', () => {
    view({ selection: new Set(['cover']) });
    const list = screen.getByRole('listbox', { name: 'Files in Music' });
    expect(list.getAttribute('aria-multiselectable')).toBe('true');
    expect(option(/Cover/).getAttribute('aria-selected')).toBe('true');
    expect(option(/Cover/).textContent).toContain('PNG image');
    expect(option(/Media/).textContent).toContain('free of');
  });

  it('selects with click, Ctrl+click and Shift+click, and opens on double-click', async () => {
    const user = userEvent.setup();
    const p = view();
    await user.click(option(/Cover/));
    expect(p.onSelect).toHaveBeenLastCalledWith('cover', 'replace');
    await user.keyboard('{Control>}');
    await user.click(option(/Notes/));
    await user.keyboard('{/Control}{Shift>}');
    await user.click(option(/Albums/));
    await user.keyboard('{/Shift}');
    expect(vi.mocked(p.onSelect).mock.calls.map((c) => c[1])).toEqual(['replace', 'toggle', 'range']);
    await user.dblClick(option(/Albums/));
    expect(p.onOpen).toHaveBeenCalledWith(items[0]);
  });

  it('moves and selects with the arrows, opens with Enter and passes commands on', async () => {
    const user = userEvent.setup();
    const p = view({ onSelectAll: vi.fn() });
    option(/Albums/).focus();
    await user.keyboard('{ArrowDown}');
    await flush();
    expect(document.activeElement).toBe(option(/Cover/));
    expect(p.onSelect).toHaveBeenLastCalledWith('cover', 'replace');
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}');
    expect(p.onSelect).toHaveBeenLastCalledWith('notes', 'range');
    await user.keyboard('{Enter}');
    expect(p.onOpen).toHaveBeenCalledWith(items[2]);
    await user.keyboard('{F2}{Delete}{Backspace}{Control>}a{/Control}');
    expect(vi.mocked(p.onCommand).mock.calls.map((c) => c[0])).toEqual(['rename', 'delete', 'up']);
    expect(p.onSelectAll).toHaveBeenCalled();
  });

  it('sorts from the headers, and renames in place', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const onRenameCommit = vi.fn();
    view({ sort: { key: 'size', dir: 'desc' }, onSortChange, renamingId: 'notes', onRenameCommit });
    expect(screen.getByRole('button', { name: 'Sort by Size' }).getAttribute('aria-pressed')).toBe('true');
    const input = screen.getByRole('textbox', { name: 'Rename Notes.txt' }) as HTMLInputElement;
    expect([input.selectionStart, input.selectionEnd]).toEqual([0, 5]);
    await user.keyboard('{Backspace}Ideas{Enter}');
    expect(onRenameCommit).toHaveBeenCalledWith('notes', 'Ideas.txt');
    await user.click(screen.getByRole('button', { name: 'Sort by Name' }));
    expect(onSortChange).toHaveBeenCalledWith('name');
  });

  it('does not open unavailable entries, and says when it is empty', async () => {
    const user = userEvent.setup();
    const p = view({ isDisabled: (e) => e.kind === 'file' });
    expect(option(/Cover/).getAttribute('aria-disabled')).toBe('true');
    await user.dblClick(option(/Cover/));
    expect(p.onOpen).not.toHaveBeenCalled();
  });

  describe('when the list changes', () => {
    const other: FsEntry[] = [
      { id: 'live', name: 'Live', kind: 'folder', children: [] },
      { id: 'demo', name: 'Demo.wav', kind: 'file', size: 4096 },
      { id: 'mix', name: 'Mix.wav', kind: 'file', size: 4096 },
    ];
    const setup = () => {
      const p = { onSelect: vi.fn(), onOpen: vi.fn() };
      const el = (list: FsEntry[]) => <FileView label="Files in Music" items={list} view="details" selection={new Set()} {...p} />;
      const { rerender } = render(el(items));
      return { p, show: (list: FsEntry[]) => rerender(el(list)) };
    };
    const tabStop = () => screen.getAllByRole('option').filter((o) => o.tabIndex === 0);

    it('starts at the first entry of another folder', async () => {
      const user = userEvent.setup();
      const { p, show } = setup();
      await user.click(option(/Media/));
      show(other);
      expect(tabStop()).toEqual([option(/Live/)]);
      await user.click(option(/Mix/));
      show([]);
      show(items);
      expect(tabStop()).toEqual([option(/Albums/)]);
      expect(p.onOpen).not.toHaveBeenCalled();
    });

    it('keeps the focus on the same entry when entries come, go or move above it', async () => {
      const user = userEvent.setup();
      const { p, show } = setup();
      await user.click(option(/Notes/));
      show([other[1], ...items]);
      await user.keyboard('{Enter}');
      show(items.slice(2));
      await user.keyboard('{Enter}');
      show([...items].reverse());
      await user.keyboard('{Enter}');
      expect(vi.mocked(p.onOpen).mock.calls.map(([e]) => e.id)).toEqual(['notes', 'notes', 'notes']);
      expect(tabStop()).toEqual([option(/Notes/)]);
    });

    it('moves the focus to the entry now in the place of one that left, and keeps it in the list', () => {
      const { show } = setup();
      option(/Cover/).focus();
      show(items.filter((e) => e.id !== 'cover'));
      expect(document.activeElement).toBe(option(/Notes/));
      show(other);
      expect(document.activeElement).toBe(option(/Live/));
      show([]);
      expect(document.activeElement).toBe(screen.getByRole('listbox'));
    });
  });

  it('shows the empty text', () => {
    render(<FileView label="Files" items={[]} view="tiles" selection={new Set()} onSelect={() => {}} onOpen={() => {}} labels={{ folderEmpty: 'Vacía' }} />);
    expect(screen.getByText('Vacía')).toBeTruthy();
  });
});
