import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_MEDIA_STATE, type MediaController } from '../../lib/media';
import { PipPlayer } from '../PipPlayer';
import { VideoPlayer } from './VideoPlayer';

const media = (over: Partial<MediaController> = {}): MediaController => ({
  ...INITIAL_MEDIA_STATE, currentTime: 50, duration: 100, volume: 0.5,
  play: vi.fn(), pause: vi.fn(), toggle: vi.fn(), seek: vi.fn(), skip: vi.fn(), setVolume: vi.fn(), toggleMute: vi.fn(), setRate: vi.fn(), ...over,
});

afterEach(() => vi.useRealTimers());

describe('VideoPlayer', () => {
  it('is a focusable player named by its title, with the shortcuts on its keys', () => {
    const m = media();
    const onCaptions = vi.fn();
    render(<VideoPlayer media={m} title="Tidal Lines" captions={{ onToggle: onCaptions }}><canvas /></VideoPlayer>);
    const player = screen.getByLabelText('Tidal Lines');
    expect(player.tabIndex).toBe(0);
    fireEvent.keyDown(player, { key: 'k' });
    fireEvent.keyDown(player, { key: 'l' });
    fireEvent.keyDown(player, { key: 'ArrowLeft' });
    fireEvent.keyDown(player, { key: 'ArrowUp' });
    fireEvent.keyDown(player, { key: 'm' });
    fireEvent.keyDown(player, { key: 'c' });
    fireEvent.keyDown(player, { key: '3' });
    expect(m.toggle).toHaveBeenCalledTimes(1);
    expect(vi.mocked(m.skip).mock.calls).toEqual([[10], [-5]]);
    expect(m.setVolume).toHaveBeenCalledWith(0.55);
    expect(m.toggleMute).toHaveBeenCalledTimes(1);
    expect(onCaptions).toHaveBeenCalledTimes(1);
    expect(m.seek).toHaveBeenCalledWith(30);
  });

  it('leaves the arrows to a focused control', () => {
    const m = media();
    render(<VideoPlayer media={m} title="Tidal Lines"><canvas /></VideoPlayer>);
    fireEvent.keyDown(screen.getByRole('slider', { name: 'Seek' }), { key: 'ArrowLeft' });
    expect(m.skip).not.toHaveBeenCalled();
  });

  it('shows the header over the picture and hides the overlay chrome after a while when playing', () => {
    vi.useFakeTimers();
    const onBack = vi.fn();
    render(<VideoPlayer media={media({ playing: true })} controls="overlay" title="Tidal Lines" overline="Episode 2" onBack={onBack}><canvas /></VideoPlayer>);
    const player = screen.getByLabelText('Tidal Lines');
    expect(player.className).toBe('ps-video-player ps-video-player--overlay');
    expect(screen.getByText('Episode 2')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(onBack).toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(3000));
    expect(player.className).toContain('is-idle');
    fireEvent.pointerMove(player);
    expect(player.className).not.toContain('is-idle');
  });
});

describe('PipPlayer', () => {
  it('plays with Space, closes, and passes its drag attributes to the free space', async () => {
    const m = media();
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <PipPlayer media={m} title="Tidal Lines" onClose={onClose} dragHandleProps={{ 'data-drag-region': '' }}><canvas /></PipPlayer>
    );
    const player = screen.getByLabelText('Tidal Lines');
    fireEvent.keyDown(player, { key: ' ' });
    expect(m.toggle).toHaveBeenCalledTimes(1);
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
    expect(container.querySelector('.ps-pip-player-chrome')?.hasAttribute('data-drag-region')).toBe(true);
    expect(container.querySelector('.ps-pip-player-spacer')?.hasAttribute('data-drag-region')).toBe(true);
    expect(container.querySelector('[data-tauri-drag-region]')).toBeNull();
  });
});
