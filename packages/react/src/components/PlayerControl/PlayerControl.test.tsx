import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PlayerControl } from './PlayerControl';

const button = () => screen.getByRole('button');

describe('PlayerControl', () => {
  it('takes its name and tooltip from the label', () => {
    render(<PlayerControl label="Skip"><svg /></PlayerControl>);
    expect(screen.getByRole('button', { name: 'Skip' })).toBe(button());
    expect(button().getAttribute('title')).toBe('Skip');
    expect(button().getAttribute('type')).toBe('button');
    expect(button().className).toBe('ps-player-control');
  });

  it('turns variant, size and pressed into classes, and announces a toggle', () => {
    const { rerender } = render(<PlayerControl label="Play" variant="primary" size="sm"><svg /></PlayerControl>);
    expect(button().className).toBe('ps-player-control ps-player-control--primary ps-player-control--sm');
    expect(button().hasAttribute('aria-pressed')).toBe(false);
    rerender(<PlayerControl label="Sound" variant="ghost" pressed><svg /></PlayerControl>);
    expect(button().className).toBe('ps-player-control ps-player-control--ghost is-on');
    expect(button().getAttribute('aria-pressed')).toBe('true');
  });

  it('is pressed with a click and the keys, not when disabled; forwards ref and attributes', async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    const user = userEvent.setup();
    const { rerender } = render(<PlayerControl ref={ref} label="Skip" onClick={onClick} className="mine" data-id="1"><svg /></PlayerControl>);
    expect(ref.current).toBe(button());
    expect(button().className).toBe('ps-player-control mine');
    expect(button().dataset.id).toBe('1');
    await user.click(button());
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
    rerender(<PlayerControl label="Skip" onClick={onClick} disabled><svg /></PlayerControl>);
    await user.click(button());
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});
