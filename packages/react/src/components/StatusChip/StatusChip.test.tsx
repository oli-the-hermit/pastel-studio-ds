import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { StatusChip } from './StatusChip';

describe('StatusChip', () => {
  it('is a button with the label and the value, carrying its tone', async () => {
    const user = userEvent.setup();
    const onOpen = vi.fn();
    const { container } = render(<StatusChip tone="live" label="Focusing" value="18:06" onOpen={onOpen} openTitle="Go to the timer" />);
    const main = screen.getByRole('button', { name: /Focusing/ });
    expect(main.textContent).toBe('Focusing18:06');
    expect(main.getAttribute('title')).toBe('Go to the timer');
    expect(container.querySelector('.ps-status-chip--live')).toBeTruthy();
    await user.click(main);
    expect(onOpen).toHaveBeenCalled();
  });

  it('adds a named action only when given one', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<StatusChip tone="idle" label="Ready" onOpen={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    rerender(<StatusChip tone="paused" label="Paused" onOpen={() => {}} action={{ label: 'Play', icon: <svg />, onClick }} />);
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('takes an app\'s own tone through its class, and forwards the ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<StatusChip ref={ref} tone="live" label="On break" onOpen={() => {}} className="is-break" data-tour="status" />);
    expect(ref.current?.classList.contains('is-break')).toBe(true);
    expect(ref.current?.getAttribute('data-tour')).toBe('status');
  });
});
