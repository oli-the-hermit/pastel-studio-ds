import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { INITIAL_MEDIA_STATE, type MediaController } from '../../lib/media';
import type { Track } from '../../lib/types';
import { MusicPlayer } from './MusicPlayer';

const track: Track = { id: 't', title: 'Northbound', artist: 'Glass Harbor', album: 'Midnight Static', duration: 200 };
const media = (over: Partial<MediaController> = {}): MediaController => ({
  ...INITIAL_MEDIA_STATE,
  currentTime: 64,
  duration: 200,
  play: vi.fn(),
  pause: vi.fn(),
  toggle: vi.fn(),
  seek: vi.fn(),
  skip: vi.fn(),
  setVolume: vi.fn(),
  toggleMute: vi.fn(),
  setRate: vi.fn(),
  ...over,
});

describe('MusicPlayer', () => {
  it('is a section named Now playing with the track as its heading and a seek bar that reads the time', () => {
    const ref = createRef<HTMLElement>();
    render(<MusicPlayer ref={ref} media={media()} track={track} source="Album · Midnight Static" />);
    expect(screen.getByRole('region', { name: 'Now playing' })).toBe(ref.current);
    expect(screen.getByRole('heading', { level: 2 }).textContent).toBe('Northbound');
    expect(screen.getByRole('slider', { name: 'Seek' }).getAttribute('aria-valuetext')).toBe('1:04 of 3:20');
    expect(screen.getByText('Album · Midnight Static')).toBeTruthy();
    expect(ref.current?.className).toBe('ps-music-player');
  });

  it('plays and pauses through the controller, and shows pause while playing', async () => {
    const m = media();
    const user = userEvent.setup();
    const { rerender } = render(<MusicPlayer media={m} track={track} />);
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(m.toggle).toHaveBeenCalledTimes(1);
    rerender(<MusicPlayer media={media({ playing: true })} track={track} layout="row" />);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
    expect(screen.getByRole('region').className).toBe('ps-music-player ps-music-player--row is-playing');
  });

  it('shows each tool only when its handler is given', async () => {
    const onQueueToggle = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<MusicPlayer media={media()} track={track} />);
    expect(screen.queryByRole('button', { name: 'Queue' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add to Liked' })).toBeNull();
    rerender(
      <MusicPlayer
        media={media()}
        track={track}
        onLikedChange={() => {}}
        onQueueToggle={onQueueToggle}
        queueOpen
        soundSettings={[{ key: 'eq', label: 'Equalizer', onSelect: () => {} }]}
        actions={[{ key: 'add', label: 'Add to playlist', onSelect: () => {} }]}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Queue' }));
    expect(onQueueToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Queue' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Add to Liked' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Sound settings' }));
    expect(screen.getByRole('menuitem', { name: 'Equalizer' })).toBeTruthy();
  });
});
