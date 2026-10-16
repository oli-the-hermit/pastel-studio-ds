import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { FsEntry } from '../../lib/fs';
import { DetailsPane } from './DetailsPane';

const folder: FsEntry = { id: 'albums', name: 'Albums', kind: 'folder', children: [] };
const cover: FsEntry = { id: 'cover', name: 'Cover.png', kind: 'file', size: 2048, meta: { Dimensions: '3000 × 3000' } };
const notes: FsEntry = { id: 'notes', name: 'Notes.txt', kind: 'file', size: 1024 };
const fact = (term: string) => screen.getByText(term).nextElementSibling?.textContent;

describe('DetailsPane', () => {
  it('describes one file with its facts', () => {
    render(<DetailsPane entries={[cover]} folder={folder} location="Music › Albums" />);
    expect(screen.getByRole('complementary', { name: 'Details' })).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Cover.png' })).toBeTruthy();
    expect(fact('Type')).toBe('PNG image');
    expect(fact('Location')).toBe('Music › Albums');
    expect(fact('Dimensions')).toBe('3000 × 3000');
  });

  it('describes the folder when nothing is selected, and counts several', () => {
    const { rerender } = render(<DetailsPane entries={[]} folder={folder} />);
    expect(fact('Items')).toBe('0');
    rerender(<DetailsPane entries={[cover, notes]} folder={folder} labels={{ itemsSelected: '{count} elegidos' }} />);
    expect(screen.getByRole('heading', { name: '2 elegidos' })).toBeTruthy();
    expect(fact('Size')).toMatch(/3/);
  });

  it('meters a drive, red when nearly full', () => {
    render(<DetailsPane entries={[{ id: 'c', name: 'System (C:)', kind: 'drive', capacity: 100, free: 5 }]} folder={folder} />);
    expect(screen.getByRole('progressbar', { name: 'Used space' }).className).toContain('ps-progress-bar--danger');
  });
});
