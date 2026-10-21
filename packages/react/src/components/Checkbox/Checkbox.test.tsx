import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('is a native checkbox that reports the new state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Checkbox checked={false} onChange={onChange} aria-label="Write the draft" />);
    const box = screen.getByRole('checkbox', { name: 'Write the draft' });
    expect(box.classList.contains('ps-checkbox')).toBe(true);
    await user.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles with Space and does nothing while disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(<Checkbox checked onChange={onChange} aria-label="Done" />);
    screen.getByRole('checkbox').focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledWith(false);
    onChange.mockClear();
    rerender(<Checkbox checked onChange={onChange} aria-label="Done" disabled />);
    await user.click(screen.getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards the ref and other attributes', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} checked={false} onChange={() => {}} aria-disabled="true" title="Follows its sessions" />);
    expect(ref.current?.getAttribute('aria-disabled')).toBe('true');
    expect(ref.current?.title).toBe('Follows its sessions');
  });
});
