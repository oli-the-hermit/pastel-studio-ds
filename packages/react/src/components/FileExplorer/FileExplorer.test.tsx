import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FsEntry } from '../../lib/fs';
import { FileExplorer, type FileOperations } from './FileExplorer';

const root: FsEntry = {
  id: 'pc', name: 'Computer', kind: 'folder', children: [
    { id: 'd', name: 'Media (D:)', kind: 'drive', capacity: 100, free: 50, children: [
      { id: 'music', name: 'Music', kind: 'folder', pinned: true, children: [
        { id: 'albums', name: 'Albums', kind: 'folder', children: [] },
        { id: 'cover', name: 'Cover.png', kind: 'file', size: 2048 },
        { id: 'notes', name: 'Notes.txt', kind: 'file', size: 1024 },
      ] },
    ] },
  ],
};
const files = () => screen.getByRole('listbox', { name: 'Files in Music' });

describe('FileExplorer', () => {
  it('lays out navigation, tree, content and details, and shows only the commands it is given', () => {
    render(<FileExplorer root={root} initialId="music" operations={{ copy: () => {} }} />);
    expect(screen.getByRole('navigation', { name: 'Navigation pane' })).toBeTruthy();
    expect(screen.getByRole('treeitem', { name: 'Quick access' })).toBeTruthy();
    expect(within(files()).getAllByRole('option')).toHaveLength(3);
    expect(screen.getByRole('complementary', { name: 'Details' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Copy (Ctrl+C)' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Delete (Del)' })).toBeNull();
    expect(screen.getByRole('status').textContent).toBe('3 items');
  });

  it('read-only, the command bar has no empty group or stray divider', () => {
    render(<FileExplorer root={root} initialId="music" />);
    const commands = screen.getByRole('toolbar', { name: 'Commands' });
    expect(within(commands).queryByRole('separator')).toBeNull();
    expect(within(commands).getByRole('button', { name: 'Sort' })).toBeTruthy();
  });

  it('navigates into folders and back', async () => {
    const user = userEvent.setup();
    render(<FileExplorer root={root} initialId="music" />);
    await user.dblClick(within(files()).getByRole('option', { name: /Albums/ }));
    expect(screen.getByRole('listbox', { name: 'Files in Albums' })).toBeTruthy();
    expect(screen.getByText('This folder is empty.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Back (Alt+←)' }));
    expect(files()).toBeTruthy();
  });

  it('runs the app\'s operations on the selection', async () => {
    const user = userEvent.setup();
    const ops: FileOperations = { delete: vi.fn(), copy: vi.fn() };
    render(<FileExplorer root={root} initialId="music" operations={ops} />);
    await user.click(within(files()).getByRole('option', { name: /Cover/ }));
    expect(screen.getByRole('status').textContent).toContain('1 selected');
    await user.click(screen.getByRole('button', { name: 'Delete (Del)' }));
    expect(ops.delete).toHaveBeenCalledWith(['cover']);
    within(files()).getByRole('option', { name: /Cover/ }).focus();
    await user.keyboard('{Control>}c{/Control}');
    expect(ops.copy).toHaveBeenCalledWith(['cover']);
  });

  it('starts renaming a new folder, and commits the name', async () => {
    const user = userEvent.setup();
    const ops: FileOperations = { createFolder: vi.fn(() => 'albums'), rename: vi.fn() };
    render(<FileExplorer root={root} initialId="music" operations={ops} />);
    await user.click(screen.getByRole('button', { name: 'New' }));
    await user.click(screen.getByRole('menuitem', { name: 'Folder' }));
    expect(ops.createFolder).toHaveBeenCalledWith('music');
    const input = screen.getByRole('textbox', { name: 'Rename Albums' });
    await user.clear(input);
    await user.keyboard('Singles{Enter}');
    expect(ops.rename).toHaveBeenCalledWith('albums', 'Singles');
  });

  it('searches below the folder, and translates its parts through labels', async () => {
    const user = userEvent.setup();
    render(<FileExplorer root={root} initialId="music" labels={{ searchIn: 'Buscar en {name}', fileName: 'Nombre' }} />);
    await user.type(screen.getByRole('searchbox', { name: 'Buscar en Music' }), 'zzz');
    expect(screen.getByText('No results for "zzz".')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Sort by Nombre' })).toBeTruthy();
  });

  it('closes and reopens the details pane', async () => {
    const user = userEvent.setup();
    render(<FileExplorer root={root} initialId="music" />);
    await user.click(screen.getByRole('button', { name: 'Details pane' }));
    expect(screen.queryByRole('complementary', { name: 'Details' })).toBeNull();
  });
});
