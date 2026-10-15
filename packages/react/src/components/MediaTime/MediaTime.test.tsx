import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MediaTime } from './MediaTime';

describe('MediaTime', () => {
  it('writes the time in each mode', () => {
    const { container, rerender } = render(<MediaTime current={64} duration={200} />);
    expect(container.textContent).toBe('1:04 / 3:20');
    rerender(<MediaTime current={64} duration={200} mode="elapsed" />);
    expect(container.textContent).toBe('1:04');
    rerender(<MediaTime current={64} duration={200} mode="remaining" />);
    expect(container.textContent).toBe('-2:16');
    rerender(<MediaTime current={64} duration={200} mode="total" size="sm" />);
    expect(container.textContent).toBe('3:20');
    expect(container.firstElementChild?.className).toBe('ps-media-time ps-media-time--sm');
  });

  it('as a toggle, flips to the remaining time and back on its own', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();
    render(<MediaTime current={64} duration={200} defaultMode="elapsed" toggleable onModeChange={onModeChange} />);
    const button = screen.getByRole('button');
    expect(button.getAttribute('aria-label')).toBe('1:04. Show remaining time');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    await user.click(button);
    expect(button.textContent).toBe('-2:16');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(onModeChange).toHaveBeenLastCalledWith('remaining');
    await user.click(button);
    expect(button.textContent).toBe('1:04');
  });

  it('follows mode when it is given', async () => {
    const onModeChange = vi.fn();
    const user = userEvent.setup();
    render(<MediaTime current={64} duration={200} mode="pair" toggleable onModeChange={onModeChange} />);
    await user.click(screen.getByRole('button'));
    expect(onModeChange).toHaveBeenCalledWith('remaining');
    expect(screen.getByRole('button').textContent).toBe('1:04 / 3:20');
  });
});
