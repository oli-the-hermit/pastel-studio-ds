import { describe, expect, it } from 'vitest';
import { defaultLabels } from '../labels';
import { formatBytes } from './format';
import { categoryOf, descendants, extensionOf, findPath, matchesFilter, typeLabel, type FsEntry } from './fs';

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

describe('fs helpers', () => {
  it('reads categories and type names from the extension', () => {
    expect(extensionOf('Cover.PNG')).toBe('png');
    expect(extensionOf('.bashrc')).toBe('');
    expect(categoryOf({ kind: 'file', name: 'Song.flac' })).toBe('audio');
    expect(categoryOf({ kind: 'file', name: 'mystery.xyz' })).toBe('file');
    expect(typeLabel({ kind: 'file', name: 'Cover.png' })).toBe('PNG image');
    expect(typeLabel({ kind: 'file', name: 'Manual.pdf' })).toBe('PDF document');
    expect(typeLabel({ kind: 'file', name: 'README' })).toBe('File');
    expect(typeLabel({ kind: 'folder', name: 'Albums' })).toBe('Folder');
    expect(typeLabel({ kind: 'file', name: 'Cover.png' }, { ...defaultLabels, typeImage: 'Imagen {ext}' })).toBe('Imagen PNG');
  });

  it('finds paths, descendants and filter matches', () => {
    expect(findPath(root, 'deep')?.map((e) => e.id)).toEqual(['music', 'albums', 'deep']);
    expect(findPath(root, 'nope')).toBeNull();
    expect(descendants(root)).toHaveLength(6);
    expect(matchesFilter(root.children![1], ['png'])).toBe(true);
    expect(matchesFilter(root.children![2], ['png'])).toBe(false);
    expect(matchesFilter(root.children![0], ['png'])).toBe(true);
  });

  it('formats sizes in binary steps', () => {
    expect(formatBytes(0, 'en')).toBe('0 bytes');
    expect(formatBytes(2.4 * MB, 'en')).toBe('2.4 MB');
    expect(formatBytes(84 * MB, 'en')).toBe('84 MB');
  });
});
