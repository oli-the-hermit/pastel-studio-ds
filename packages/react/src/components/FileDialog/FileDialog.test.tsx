import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { FsEntry } from '../../lib/fs';
import { FileDialog, type FileDialogProps } from './FileDialog';

const root: FsEntry = {
  id: 'pc', name: 'Computer', kind: 'folder', children: [
    { id: 'music', name: 'Music', kind: 'folder', children: [
      { id: 'albums', name: 'Albums', kind: 'folder', children: [] },
      { id: 'cover', name: 'Cover.png', kind: 'file', size: 2048 },
      { id: 'song', name: 'Song.flac', kind: 'file', size: 4096 },
    ] },
  ],
};
const files = () => screen.getByRole('listbox', { name: 'Files in Music' });
const flush = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));
const dialog = (props: Partial<FileDialogProps> = {}) => {
  const p = { onConfirm: vi.fn(), onCancel: vi.fn(), ...props };
  render(<FileDialog open mode="open" root={root} initialId="music" {...p} />);
  return p;
};

describe('FileDialog', () => {
  it('opens a picked file, with Open ready only once a file is picked', async () => {
    const user = userEvent.setup();
    const p = dialog();
    expect(screen.getByRole('dialog', { name: 'Open' })).toBeTruthy();
    const open = screen.getByRole('button', { name: 'Open' });
    expect((open as HTMLButtonElement).disabled).toBe(true);
    await user.click(within(files()).getByRole('option', { name: /Song/ }));
    expect((screen.getByRole('textbox', { name: 'File name' }) as HTMLInputElement).value).toBe('Song.flac');
    await user.click(open);
    expect(p.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ entries: [expect.objectContaining({ id: 'song' })] }));
  });

  it('opens folders on double-click instead of picking them', async () => {
    const user = userEvent.setup();
    const p = dialog();
    await user.dblClick(within(files()).getByRole('option', { name: /Albums/ }));
    expect(screen.getByRole('listbox', { name: 'Files in Albums' })).toBeTruthy();
    expect(p.onConfirm).not.toHaveBeenCalled();
  });

  it('saves under a typed name, with the suggestion selected first', async () => {
    const user = userEvent.setup();
    const p = dialog({ mode: 'save', defaultName: 'Mix.flac' });
    expect(screen.getByRole('dialog', { name: 'Save as' })).toBeTruthy();
    await flush();
    const name = screen.getByRole('textbox', { name: 'File name' }) as HTMLInputElement;
    expect(document.activeElement).toBe(name);
    await user.keyboard('Remix.flac{Enter}');
    expect(p.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ name: 'Remix.flac', folder: expect.objectContaining({ id: 'music' }) }));
  });

  it('filters by type and picks folders in folder mode', async () => {
    const user = userEvent.setup();
    dialog({ filters: [{ label: 'Audio', extensions: ['flac'] }, { label: 'All files', extensions: ['*'] }] });
    expect(within(files()).queryByRole('option', { name: /Cover/ })).toBeNull();
    expect(within(files()).getByRole('option', { name: /Song/ })).toBeTruthy();
    await user.click(screen.getByRole('combobox', { name: 'File type' }));
    await user.click(screen.getByRole('option', { name: /All files/ }));
    expect(within(files()).getByRole('option', { name: /Cover/ })).toBeTruthy();
  });

  it('shows only folders in folder mode and confirms the current folder', async () => {
    const user = userEvent.setup();
    const p = dialog({ mode: 'folder', labels: { selectFolder: 'Elegir carpeta' } });
    expect(within(files()).getAllByRole('option')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: 'Elegir carpeta' }));
    expect(p.onConfirm).toHaveBeenCalledWith(expect.objectContaining({ folder: expect.objectContaining({ id: 'music' }) }));
  });

  it('cancels from the button and from Escape, and bookmarks the folder', async () => {
    const user = userEvent.setup();
    const onBookmarksChange = vi.fn();
    const p = dialog({ onBookmarksChange });
    await user.click(screen.getByRole('button', { name: 'Bookmark folder' }));
    expect(onBookmarksChange).toHaveBeenCalledWith([expect.objectContaining({ id: 'music' })]);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    await user.keyboard('{Escape}');
    expect(p.onCancel).toHaveBeenCalledTimes(2);
  });
});
