import React, { useRef } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Popover, type PopoverProps } from './Popover';

function Anchored(props: Partial<PopoverProps> & { open: boolean; theme?: string }) {
  const anchor = useRef<HTMLButtonElement>(null);
  const { theme, ...rest } = props;
  return (
    <div data-theme={theme}>
      <button ref={anchor}>Anchor</button>
      <span>Elsewhere</span>
      <Popover anchorRef={anchor} onClose={() => {}} role="dialog" ariaLabel="Details" {...rest}>
        <button>Inside</button>
      </Popover>
    </div>
  );
}

const panel = () => screen.queryByRole('dialog', { name: 'Details' });

describe('Popover', () => {
  it('renders nothing while closed', () => {
    render(<Anchored open={false} />);
    expect(panel()).toBeNull();
  });

  it('renders at the end of the body, outside the tree it was written in', () => {
    const { container } = render(<Anchored open className="mine" />);
    expect(panel()?.parentElement).toBe(document.body);
    expect(container.contains(panel())).toBe(false);
    expect(panel()?.classList.contains('ps-popover')).toBe(true);
    expect(panel()?.classList.contains('mine')).toBe(true);
  });

  it('takes the theme of the place it opened from', () => {
    render(<Anchored open theme="light" />);
    expect(panel()?.getAttribute('data-theme')).toBe('light');
  });

  it('closes on a press outside, and not on a press inside or on its anchor', () => {
    const onClose = vi.fn();
    render(<Anchored open onClose={onClose} />);
    fireEvent.mouseDown(screen.getByText('Inside'));
    fireEvent.mouseDown(screen.getByText('Anchor'));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByText('Elsewhere'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes on Escape, or calls onEscape instead when given', () => {
    const onClose = vi.fn();
    const onEscape = vi.fn();
    const { rerender } = render(<Anchored open onClose={onClose} />);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    rerender(<Anchored open onClose={onClose} onEscape={onEscape} />);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('keeps Escape from reaching anything behind it, such as a modal', () => {
    const behind = vi.fn();
    window.addEventListener('keydown', behind);
    render(<Anchored open />);
    fireEvent.keyDown(document.body, { key: 'Escape' });
    fireEvent.keyDown(document.body, { key: 'a' });
    window.removeEventListener('keydown', behind);
    expect(behind.mock.calls.map(([e]) => (e as KeyboardEvent).key)).toEqual(['a']);
  });

  it('stays on screen while it leaves, then goes', async () => {
    const { rerender } = render(<Anchored open />);
    rerender(<Anchored open={false} />);
    expect(panel()?.classList.contains('is-leaving')).toBe(true);
    await waitFor(() => expect(panel()).toBeNull());
  });
});
