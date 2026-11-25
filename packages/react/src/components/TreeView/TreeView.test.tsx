import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TreeView, type TreeNode } from './TreeView';

const nodes: TreeNode[] = [
  { id: 'h', label: 'Places', heading: true },
  { id: 'home', label: 'Home', children: [{ id: 'music', label: 'Music', children: [{ id: 'albums', label: 'Albums' }] }, { id: 'docs', label: 'Documents' }] },
  { id: 'drive', label: 'Backup', hasChildren: true },
];
const item = (name: string) => screen.getByRole('treeitem', { name });
const flush = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

describe('TreeView', () => {
  it('is a tree with levels, one tab stop and the selection marked', () => {
    render(<TreeView label="Folders" nodes={nodes} selectedId="music" defaultExpanded={['home']} onSelect={() => {}} />);
    expect(screen.getByRole('tree', { name: 'Folders' })).toBeTruthy();
    expect(item('Music').getAttribute('aria-level')).toBe('2');
    expect(item('Music').getAttribute('aria-selected')).toBe('true');
    expect(item('Music').tabIndex).toBe(0);
    expect(item('Home').tabIndex).toBe(-1);
    expect(item('Home').getAttribute('aria-expanded')).toBe('true');
    expect(item('Backup').getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('treeitem', { name: 'Places' })).toBeNull();
  });

  it('opens, enters, closes and climbs with the arrows, and selects with Enter', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onExpand = vi.fn();
    render(<TreeView label="Folders" nodes={nodes} onSelect={onSelect} onExpand={onExpand} />);
    item('Home').focus();
    await user.keyboard('{ArrowRight}');
    expect(onExpand).toHaveBeenCalledWith('home');
    expect(item('Music')).toBeTruthy();
    await user.keyboard('{ArrowRight}');
    await flush();
    expect(document.activeElement).toBe(item('Music'));
    await user.keyboard('{ArrowLeft}');
    await flush();
    expect(document.activeElement).toBe(item('Home'));
    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByRole('treeitem', { name: 'Music' })).toBeNull();
    await user.keyboard('{End}');
    await flush();
    expect(document.activeElement).toBe(item('Backup'));
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith('drive');
  });

  it('toggles from the chevron without selecting, and opens all siblings on *', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onExpandedChange = vi.fn();
    const { container } = render(<TreeView label="Folders" nodes={nodes} onSelect={onSelect} onExpandedChange={onExpandedChange} />);
    await user.click(container.querySelector('[data-id="home"] .ps-tree-view-twisty')!);
    expect(onSelect).not.toHaveBeenCalled();
    expect([...onExpandedChange.mock.lastCall![0]]).toEqual(['home']);
    item('Backup').focus();
    await user.keyboard('*');
    expect([...onExpandedChange.mock.lastCall![0]].sort()).toEqual(['drive', 'home']);
  });

  describe('when the selection or the rows change', () => {
    const tabStop = () => screen.getAllByRole('treeitem').filter((el) => el.tabIndex === 0);
    const tree = (props: { nodes?: TreeNode[]; selectedId?: string }) => (
      <TreeView label="Folders" nodes={nodes} defaultExpanded={['home']} onSelect={() => {}} {...props} />
    );

    it('moves the tab stop to a selection made later, by the app or here', async () => {
      const user = userEvent.setup();
      const { rerender } = render(tree({ selectedId: 'music' }));
      rerender(tree({ selectedId: 'docs' }));
      expect(tabStop()).toEqual([item('Documents')]);
      // The arrows move it without selecting; the next selection takes it back.
      item('Documents').focus();
      await user.keyboard('{ArrowUp}');
      await flush();
      expect(tabStop()).toEqual([item('Music')]);
      rerender(tree({ selectedId: 'drive' }));
      expect(tabStop()).toEqual([item('Backup')]);
    });

    it('goes to the selected row, not the first, when the focused one leaves, and keeps the focus in the tree', async () => {
      const user = userEvent.setup();
      const { rerender } = render(tree({ selectedId: 'music' }));
      item('Music').focus();
      await user.keyboard('{ArrowDown}{ArrowDown}');
      await flush();
      expect(document.activeElement).toBe(item('Documents'));
      const withoutDocs = nodes.map((n) => (n.id === 'home' ? { ...n, children: n.children!.filter((c) => c.id !== 'docs') } : n));
      rerender(tree({ nodes: withoutDocs, selectedId: 'music' }));
      expect(tabStop()).toEqual([item('Music')]);
      expect(document.activeElement).toBe(item('Music'));
      // With no selection, the first row.
      rerender(tree({ nodes: withoutDocs.filter((n) => n.id !== 'home') }));
      expect(tabStop()).toEqual([item('Backup')]);
      expect(document.activeElement).toBe(item('Backup'));
    });
  });
});
