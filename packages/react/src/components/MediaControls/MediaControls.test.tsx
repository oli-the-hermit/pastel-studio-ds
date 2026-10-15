import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { INITIAL_MEDIA_STATE, type MediaController } from '../../lib/media';
import { buildMediaSettings, speedChoices } from '../../lib/mediaSettings';
import { VideoSurface } from '../VideoSurface';
import { chapterAt, MediaControls } from './MediaControls';

const media = (over: Partial<MediaController> = {}): MediaController => ({
  ...INITIAL_MEDIA_STATE, currentTime: 52, duration: 150,
  play: vi.fn(), pause: vi.fn(), toggle: vi.fn(), seek: vi.fn(), skip: vi.fn(), setVolume: vi.fn(), toggleMute: vi.fn(), setRate: vi.fn(), ...over,
});
const chapters = [{ start: 0, title: 'Low tide' }, { start: 40, title: 'The turn' }];

describe('MediaControls', () => {
  it('basic: play, volume, time and a seek bar that reads the time', () => {
    const { container } = render(<MediaControls media={media()} />);
    expect(container.firstElementChild?.className).toBe('ps-media-controls');
    expect(screen.getByRole('slider', { name: 'Seek' }).getAttribute('aria-valuetext')).toBe('0:52 of 2:30');
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Mute' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Full screen' })).toBeNull();
  });

  it('movie: skips through the controller, names the chapter, and toggles its tools', async () => {
    const m = media();
    const onCaptions = vi.fn();
    const user = userEvent.setup();
    render(<MediaControls media={m} variant="movie" surface="overlay" title="Tidal Lines" chapters={chapters} captions={{ active: true, onToggle: onCaptions }} fullscreen={{ active: true, onToggle: vi.fn() }} />);
    await user.click(screen.getByRole('button', { name: 'Forward 10 seconds' }));
    expect(m.skip).toHaveBeenCalledWith(10);
    expect(screen.getByText('The turn')).toBeTruthy();
    expect(screen.getByText('Tidal Lines')).toBeTruthy();
    const subtitles = screen.getByRole('button', { name: 'Subtitles on' });
    expect(subtitles.getAttribute('aria-pressed')).toBe('true');
    await user.click(subtitles);
    expect(onCaptions).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Exit full screen' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Play' }).className).toContain('is-on-overlay');
  });

  it('opens the settings menu with groups that open in place', async () => {
    const onSpeed = vi.fn();
    const user = userEvent.setup();
    render(<MediaControls media={media()} surface="overlay" settings={buildMediaSettings({ speed: { value: 1, options: speedChoices(), onChange: onSpeed } })} />);
    await user.click(screen.getByRole('button', { name: 'Settings' }));
    expect(screen.getByRole('menu').className).toContain('ps-menu--overlay');
    await user.click(screen.getByRole('menuitem', { name: /Playback speed/ }));
    expect(screen.getByRole('menuitemradio', { name: 'Normal' }).getAttribute('aria-checked')).toBe('true');
    await user.click(screen.getByRole('menuitemradio', { name: '1.5×' }));
    expect(onSpeed).toHaveBeenCalledWith(1.5);
  });

  it('finds the chapter at a time', () => {
    expect(chapterAt(chapters, 10)?.title).toBe('Low tide');
    expect(chapterAt(chapters, 60)?.title).toBe('The turn');
    expect(chapterAt(undefined, 60)).toBeUndefined();
  });
});

describe('VideoSurface', () => {
  it('shows play while paused, a spinner while buffering, and replay at the end', async () => {
    const onPlay = vi.fn();
    const user = userEvent.setup();
    const { rerender, container } = render(<VideoSurface playing={false} onPlay={onPlay}><img alt="" /></VideoSurface>);
    expect(container.firstElementChild?.className).toBe('ps-video-surface ps-video-surface--fill');
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    rerender(<VideoSurface playing waiting aspectRatio={16 / 9} />);
    expect(screen.getByRole('status', { name: 'Buffering' })).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
    rerender(<VideoSurface playing={false} ended onReplay={onPlay} caption="Hello" />);
    expect(screen.getByRole('button', { name: 'Play again' })).toBeTruthy();
    expect(screen.getByText('Hello').parentElement?.getAttribute('aria-live')).toBe('polite');
  });
});
