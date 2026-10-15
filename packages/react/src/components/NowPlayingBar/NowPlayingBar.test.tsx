import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { INITIAL_MEDIA_STATE, type MediaController } from '../../lib/media';
import type { Track } from '../../lib/types';
import { NowPlayingBar } from './NowPlayingBar';

const track: Track = { id: 't', title: 'Low Tide Radio', artist: 'Glass Harbor', duration: 240 };
const media = (): MediaController => ({
  ...INITIAL_MEDIA_STATE,
  currentTime: 60,
  duration: 240,
  play: vi.fn(),
  pause: vi.fn(),
  toggle: vi.fn(),
  seek: vi.fn(),
  skip: vi.fn(),
  setVolume: vi.fn(),
  toggleMute: vi.fn(),
  setRate: vi.fn(),
});

describe('NowPlayingBar', () => {
  it('is a section named Player with the track, the transport, the seek bar and the volume', () => {
    const ref = createRef<HTMLElement>();
    const { container } = render(<NowPlayingBar ref={ref} media={media()} track={track} />);
    expect(screen.getByRole('region', { name: 'Player' })).toBe(ref.current);
    expect(screen.getByText('Low Tide Radio')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Playback' })).toBeTruthy();
    expect(screen.getByRole('slider', { name: 'Seek' }).getAttribute('aria-valuetext')).toBe('1:00 of 4:00');
    expect(screen.getByRole('slider', { name: 'Volume' })).toBeTruthy();
    expect((container.querySelector('.ps-now-playing-bar-hairline > div') as HTMLElement).style.width).toBe('25%');
  });

  it('says when nothing is playing and drops the heart', () => {
    render(<NowPlayingBar media={media()} onLikedChange={() => {}} />);
    expect(screen.getByText('Nothing playing')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Add to Liked' })).toBeNull();
  });

  it('marks the play button and the optional tools for folding, and calls the tools', async () => {
    const onExpand = vi.fn();
    const user = userEvent.setup();
    render(<NowPlayingBar media={media()} track={track} onExpand={onExpand} onQueueToggle={() => {}} />);
    expect(screen.getByRole('button', { name: 'Play' }).className).toContain('ps-transport-controls-play');
    const expand = screen.getByRole('button', { name: 'Full screen player' });
    expect(expand.className).toContain('ps-now-playing-bar-optional');
    expect(screen.getByRole('button', { name: 'Queue' }).className).not.toContain('ps-now-playing-bar-optional');
    await user.click(expand);
    expect(onExpand).toHaveBeenCalledTimes(1);
  });
});
