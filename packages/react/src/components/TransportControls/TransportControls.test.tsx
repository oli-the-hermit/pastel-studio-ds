import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { nextRepeat, TransportControls } from './TransportControls';

const noop = () => {};
const names = () => screen.getAllByRole('button').map((b) => b.getAttribute('aria-label'));

describe('TransportControls', () => {
  it('shows only the buttons it has handlers for, in order, inside a named group', () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<TransportControls ref={ref} playing={false} onPlayPause={noop} />);
    expect(screen.getByRole('group', { name: 'Playback' })).toBe(ref.current);
    expect(names()).toEqual(['Play']);
    rerender(<TransportControls playing onPlayPause={noop} onPrevious={noop} onNext={noop} onSkipBack={noop} onSkipForward={noop} onStop={noop} onShuffleChange={noop} onRepeatChange={noop} skipSeconds={15} />);
    expect(names()).toEqual(['Shuffle', 'Previous', 'Back 15 seconds', 'Stop', 'Pause', 'Forward 15 seconds', 'Next', 'Repeat: off']);
  });

  it('calls the handlers, toggles shuffle and cycles repeat', async () => {
    const onPlayPause = vi.fn();
    const onShuffleChange = vi.fn();
    const onRepeatChange = vi.fn();
    const user = userEvent.setup();
    render(<TransportControls playing={false} onPlayPause={onPlayPause} shuffle onShuffleChange={onShuffleChange} repeat="all" onRepeatChange={onRepeatChange} />);
    await user.click(screen.getByRole('button', { name: 'Play' }));
    await user.click(screen.getByRole('button', { name: 'Shuffle' }));
    await user.click(screen.getByRole('button', { name: 'Repeat: all' }));
    expect(onPlayPause).toHaveBeenCalledTimes(1);
    expect(onShuffleChange).toHaveBeenCalledWith(false);
    expect(onRepeatChange).toHaveBeenCalledWith('one');
    expect(screen.getByRole('button', { name: 'Shuffle' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('greys out previous and next at the ends', () => {
    render(<TransportControls playing={false} onPlayPause={noop} onPrevious={noop} onNext={noop} hasPrevious={false} hasNext={false} />);
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveProperty('disabled', true);
    expect(screen.getByRole('button', { name: 'Next' })).toHaveProperty('disabled', true);
  });

  it('turns size and layout into classes and takes words from its labels', () => {
    const ref = createRef<HTMLDivElement>();
    render(<TransportControls ref={ref} playing={false} onPlayPause={noop} size="sm" layout="spread" labels={{ play: 'Reproducir' }} />);
    expect(ref.current?.className).toBe('ps-transport-controls ps-transport-controls--sm ps-transport-controls--spread');
    expect(names()).toEqual(['Reproducir']);
  });
});

describe('nextRepeat', () => {
  it('cycles off, all, one', () => {
    expect([nextRepeat('off'), nextRepeat('all'), nextRepeat('one')]).toEqual(['all', 'one', 'off']);
  });
});
