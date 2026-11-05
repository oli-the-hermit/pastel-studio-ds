import { describe, expect, it } from 'vitest';
import type { FsEntry } from './fs';
import { buildNavTree, entryIdOf, isGroupRow } from './navTree';

const computer: FsEntry = {
  id: 'pc', name: 'This PC', kind: 'folder', children: [
    { id: 'c', name: 'Local Disk (C:)', kind: 'drive' },
    { id: 'd', name: 'Media (D:)', kind: 'drive', children: [
      { id: 'photos', name: 'Photos', kind: 'folder', children: [] },
      { id: 'later', name: 'Later', kind: 'folder' },
      { id: 'cover', name: 'Cover.png', kind: 'file' },
    ] },
  ],
};

describe('buildNavTree', () => {
  it('nests the drives under the computer, folders only', () => {
    const [pc] = buildNavTree(computer);
    expect(pc.children?.map((n) => n.id)).toEqual(['c', 'd']);
    expect(pc.children?.[1].children?.map((n) => n.id)).toEqual(['photos', 'later']);
  });

  it('lets a folder that is not loaded yet be expanded, and an empty one not', () => {
    const [pc] = buildNavTree(computer);
    const [c, d] = pc.children!;
    expect(c).toMatchObject({ hasChildren: true, children: undefined });
    const [photos, later] = d.children!;
    expect(photos.hasChildren).toBe(false);
    expect(later.hasChildren).toBe(true);
  });

  it('puts pinned folders in Quick access, with ids that lead back to them', () => {
    const nodes = buildNavTree(computer, { pinned: [{ id: 'photos', name: 'Photos', kind: 'folder' }] });
    const quick = nodes.find((n) => n.id === '__quick')!;
    expect(isGroupRow(quick.id)).toBe(true);
    expect(entryIdOf(quick.children![0].id)).toBe('photos');
  });
});
