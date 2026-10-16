import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { FsEntry } from './fs';
import { useFileBrowser } from './useFileBrowser';

const MB = 1024 ** 2;
const root: FsEntry = {
  id: 'music', name: 'Music', kind: 'folder', children: [
    { id: 'albums', name: 'Albums', kind: 'folder', children: [{ id: 'deep', name: 'Deep tide.flac', kind: 'file', size: 30 * MB }] },
    { id: 'b', name: 'b.png', kind: 'file', size: 2 * MB, modified: '2026-09-02T10:00:00' },
    { id: 'a10', name: 'a10.txt', kind: 'file', size: 10, modified: '2026-09-03T10:00:00' },
    { id: 'a2', name: 'a2.txt', kind: 'file', size: 20, modified: '2026-09-01T10:00:00' },
    { id: 'h', name: '.hidden', kind: 'file', size: 1, hidden: true },
  ],
};

const ids = (list: FsEntry[]) => list.map((e) => e.id);

describe('useFileBrowser', () => {
  it('lists folders first, in natural order, without hidden files', () => {
    const { result } = renderHook(() => useFileBrowser(root));
    expect(ids(result.current.items)).toEqual(['albums', 'a2', 'a10', 'b']);
    act(() => result.current.setShowHidden(true));
    expect(ids(result.current.items)).toContain('h');
  });

  it('sorts by a column and flips on a second toggle', () => {
    const { result } = renderHook(() => useFileBrowser(root));
    act(() => result.current.toggleSort('size'));
    expect(ids(result.current.items)).toEqual(['albums', 'a10', 'a2', 'b']);
    act(() => result.current.toggleSort('size'));
    expect(ids(result.current.items)).toEqual(['albums', 'b', 'a2', 'a10']);
  });

  it('selects by replace, toggle and range', () => {
    const { result } = renderHook(() => useFileBrowser(root));
    act(() => result.current.select('a2'));
    act(() => result.current.select('b', 'range'));
    expect([...result.current.selection]).toEqual(['a2', 'a10', 'b']);
    act(() => result.current.select('a10', 'toggle'));
    expect([...result.current.selection].sort()).toEqual(['a2', 'b']);
  });

  it('navigates with history, opens files through onOpenFile, and searches below the folder', () => {
    const onOpenFile = vi.fn();
    const { result } = renderHook(() => useFileBrowser(root, { onOpenFile }));
    act(() => result.current.open(result.current.items[0]));
    expect(result.current.current.id).toBe('albums');
    expect(result.current.canUp).toBe(true);
    act(() => result.current.back());
    expect(result.current.current.id).toBe('music');
    expect(result.current.canForward).toBe(true);
    act(() => result.current.forward());
    act(() => result.current.open(result.current.items[0]));
    expect(onOpenFile).toHaveBeenCalledWith(expect.objectContaining({ id: 'deep' }));
    act(() => result.current.up());
    act(() => result.current.setQuery('tide'));
    expect(ids(result.current.items)).toEqual(['deep']);
    expect(result.current.locationOf(result.current.items[0])).toBe('Albums');
  });
});
