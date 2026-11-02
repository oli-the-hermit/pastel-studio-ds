import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MediaTile } from './MediaTile';

describe('MediaTile', () => {
  it('shows the thumbnail, the name and the meta line', () => {
    const { container } = render(<MediaTile name="beach.png" src="beach.png" meta="1920 × 1080" />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('beach.png');
    expect(screen.getByText('beach.png').className).toBe('ps-media-tile-name');
    expect(screen.getByText('1920 × 1080')).toBeTruthy();
  });

  it('falls back to the file type icon without a thumbnail or when it fails', () => {
    const { container, rerender } = render(<MediaTile name="clip.mp4" />);
    expect(container.querySelector('.ps-file-icon.is-video')).toBeTruthy();
    rerender(<MediaTile name="clip.mp4" src="broken.jpg" />);
    fireEvent.error(container.querySelector('img')!);
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('.ps-file-icon')).toBeTruthy();
  });

  it('names the favorite mark, so the state is not only an icon', () => {
    render(<MediaTile name="a.png" favorite labels={{ favorite: 'Favorito' }} />);
    expect(screen.getByRole('img', { name: 'Favorito' })).toBeTruthy();
  });

  it('turns its states into classes and keeps the check for files only', () => {
    const { container, rerender } = render(<MediaTile name="a.png" selected selecting preview="add" loading dimmed />);
    const tile = container.firstElementChild!;
    for (const name of ['is-selected', 'is-selecting', 'is-preview-add', 'is-loading', 'is-dimmed']) expect(tile.classList.contains(name)).toBe(true);
    expect(container.querySelector('[data-media-check]')?.getAttribute('aria-hidden')).toBe('true');
    rerender(<MediaTile name="Holidays" kind="folder" meta="12 items" />);
    expect(container.firstElementChild!.classList.contains('ps-media-tile--folder')).toBe(true);
    expect(container.querySelector('[data-media-check]')).toBeNull();
    expect(container.querySelector('.ps-file-icon.is-folder')).toBeTruthy();
  });

  it('puts the caption over the thumbnail with caption="overlay"', () => {
    const { container } = render(<MediaTile name="a.png" caption="overlay" meta="10 × 10" />);
    expect(container.firstElementChild!.classList.contains('ps-media-tile--overlay-caption')).toBe(true);
    expect(screen.getByText('a.png')).toBeTruthy();
  });

  it('shows the duration, the source and the actions it is given', () => {
    render(<MediaTile name="a.mp4" duration="1:02" source={<span>site</span>} actions={<button type="button">Like</button>} />);
    expect(screen.getByText('1:02').className).toBe('ps-media-tile-duration');
    expect(screen.getByText('site')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Like' })).toBeTruthy();
  });
});
