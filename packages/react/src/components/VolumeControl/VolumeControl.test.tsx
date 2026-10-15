import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { VolumeControl } from './VolumeControl';

const noop = () => {};

describe('VolumeControl', () => {
  it('mutes from the button and reads the level as a percent', async () => {
    const onMuteToggle = vi.fn();
    const user = userEvent.setup();
    render(<VolumeControl volume={0.7} muted={false} onVolumeChange={noop} onMuteToggle={onMuteToggle} />);
    await user.click(screen.getByRole('button', { name: 'Mute' }));
    expect(onMuteToggle).toHaveBeenCalledTimes(1);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider.getAttribute('aria-valuenow')).toBe('70');
    expect(slider.getAttribute('aria-valuetext')).toBe('70%');
  });

  it('steps 5% with the arrow keys and reports 0–1', async () => {
    const onVolumeChange = vi.fn();
    const user = userEvent.setup();
    render(<VolumeControl volume={0.7} muted={false} onVolumeChange={onVolumeChange} onMuteToggle={noop} />);
    screen.getByRole('slider').focus();
    await user.keyboard('{ArrowRight}');
    expect(onVolumeChange).toHaveBeenLastCalledWith(0.75);
  });

  it('shows the slider at 0 and offers Unmute while muted', () => {
    render(<VolumeControl volume={0.7} muted onVolumeChange={noop} onMuteToggle={noop} />);
    expect(screen.getByRole('button', { name: 'Unmute' })).toBeTruthy();
    expect(screen.getByRole('slider').getAttribute('aria-valuenow')).toBe('0');
  });

  it('has no slider as a button, and turns layout into a class', () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<VolumeControl ref={ref} layout="button" volume={0.5} muted={false} onVolumeChange={noop} onMuteToggle={noop} />);
    expect(screen.queryByRole('slider')).toBeNull();
    expect(ref.current?.className).toBe('ps-volume-control ps-volume-control--button');
    rerender(<VolumeControl ref={ref} layout="inline" volume={0.5} muted={false} onVolumeChange={noop} onMuteToggle={noop} />);
    expect(ref.current?.className).toBe('ps-volume-control');
  });
});
