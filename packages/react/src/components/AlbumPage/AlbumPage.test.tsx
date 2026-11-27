import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Album } from '../../lib/types';
import { AlbumDetails } from '../AlbumDetails';
import { AlbumHeader } from '../AlbumHeader';
import { AlbumPage } from './AlbumPage';

const album: Album = {
  id: 'ms',
  title: 'Midnight Static',
  artist: 'Glass Harbor',
  kind: 'Album',
  year: 2026,
  label: 'Lantern Tape Co.',
  description: 'Long notes.',
  tracks: [
    { id: 'a', title: 'Signal Fires', artist: 'Glass Harbor', duration: 1800 },
    { id: 'b', title: 'Northbound', artist: 'Glass Harbor', duration: 1800 },
  ],
};
const noop = () => {};

describe('AlbumHeader', () => {
  it('shows the kind, the title as the h1, and the facts in words', () => {
    render(<AlbumHeader album={album} onPlayPause={noop} />);
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Midnight Static');
    expect(screen.getByText('Album')).toBeTruthy();
    expect(screen.getByText('2 songs')).toBeTruthy();
    expect(screen.getByText(/1 hr/)).toBeTruthy();
  });

  it('plays, saves and shuffles, each only when wired', async () => {
    const onPlayPause = vi.fn();
    const onSavedChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<AlbumHeader album={{ ...album, kind: 'Playlist', tracks: album.tracks.slice(0, 1) }} onPlayPause={onPlayPause} />);
    expect(screen.getByText('Playlist')).toBeTruthy();
    expect(screen.getByText('1 song')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save to library' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
    rerender(<AlbumHeader album={album} onPlayPause={onPlayPause} playing saved onSavedChange={onSavedChange} />);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Remove from library' }));
    expect(onSavedChange).toHaveBeenCalledWith(false);
  });
});

describe('AlbumDetails', () => {
  it('is a section named by its heading, folds its description, and lists only the known facts', async () => {
    const user = userEvent.setup();
    render(<AlbumDetails album={album} />);
    expect(screen.getByRole('region', { name: 'About this album' })).toBeTruthy();
    const toggle = screen.getByRole('button', { name: 'Show more' });
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await user.click(toggle);
    expect(screen.getByRole('button', { name: 'Show less' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('term').map((t) => t.textContent)).toEqual(['Label', 'Tracks', 'Length']);
  });
});

describe('AlbumPage', () => {
  it('puts the header, the tracks named by the album, and the details on one card', () => {
    const { container } = render(<AlbumPage album={album} onPlayPause={noop} onPlayTrack={noop} />);
    expect(container.firstElementChild?.className).toBe('ps-album-page');
    expect(screen.getByRole('list', { name: 'Midnight Static' })).toBeTruthy();
    expect(screen.getByRole('region', { name: 'About this album' })).toBeTruthy();
  });

  it('hands a track that is unavailable to onUnavailable, not to onPlayTrack', () => {
    const onPlayTrack = vi.fn();
    const onUnavailable = vi.fn();
    const missing = { ...album.tracks[1], unavailable: "Can't find this file" };
    const { container } = render(<AlbumPage album={{ ...album, tracks: [album.tracks[0], missing] }} onPlayPause={noop} onPlayTrack={onPlayTrack} onUnavailable={onUnavailable} />);
    const [first, second] = screen.getAllByRole('listitem');
    fireEvent.doubleClick(second);
    expect(onUnavailable).toHaveBeenCalledWith(missing);
    expect(onPlayTrack).not.toHaveBeenCalled();
    fireEvent.doubleClick(first);
    expect(onPlayTrack).toHaveBeenCalledWith(album.tracks[0]);
    // The handler is the page's own: it never reaches the header's element.
    expect(container.querySelector('header')?.getAttributeNames()).toEqual(['class']);
  });
});

describe('A playlist', () => {
  const playlist: Album = { ...album, title: 'Road trip', artist: '', kind: 'Playlist', year: undefined, label: undefined };

  it('has no artist in its header: its facts start at the songs', () => {
    const { container } = render(<AlbumHeader album={playlist} onPlayPause={noop} />);
    expect(screen.getByText('Playlist')).toBeTruthy();
    expect(container.querySelector('.ps-album-header-artist')).toBeNull();
    expect(container.querySelector('.ps-album-header-meta')?.firstElementChild?.textContent).toBe('2 songs');
  });

  it('shows a mosaic of its covers when it has no cover of its own', () => {
    const covers = ['1.png', '2.png', '3.png', '4.png'];
    const { container, rerender } = render(<AlbumHeader album={{ ...playlist, covers }} onPlayPause={noop} />);
    expect(screen.getByRole('img', { name: 'Road trip' }).className).toBe('ps-cover-art-mosaic');
    expect(Array.from(container.querySelectorAll('.ps-cover-art-mosaic img'), (img) => img.getAttribute('src'))).toEqual(covers);
    rerender(<AlbumHeader album={{ ...playlist, cover: 'own.png', covers }} onPlayPause={noop} />);
    expect(screen.getByRole('img', { name: 'Road trip' }).getAttribute('src')).toBe('own.png');
  });

  it('is described as a playlist, not an album', () => {
    render(<AlbumDetails album={playlist} />);
    expect(screen.getByRole('region', { name: 'About this playlist' })).toBeTruthy();
  });
});
