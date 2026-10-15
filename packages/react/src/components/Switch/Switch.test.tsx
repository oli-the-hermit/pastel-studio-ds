import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';

const toggle = () => screen.getByRole('switch');

describe('Switch', () => {
  it('is a switch named by its label, with its hint in the row', () => {
    render(<Switch label="Sound alerts" hint="A chime when a session ends" checked onChange={() => {}} />);
    expect(screen.getByRole('switch', { name: /Sound alerts/ })).toBe(toggle());
    expect((toggle() as HTMLInputElement).checked).toBe(true);
    expect(toggle().closest('label')?.className).toBe('ps-switch');
    expect(toggle().closest('label')?.querySelector('.ps-switch-hint')?.textContent).toBe('A chime when a session ends');
  });

  it('reports the new value from a click anywhere on the row, and from Space', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch label="Sound alerts" checked={false} onChange={onChange} />);
    await user.click(screen.getByText('Sound alerts'));
    expect(onChange).toHaveBeenLastCalledWith(true);
    toggle().focus();
    await user.keyboard(' ');
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('does nothing when disabled', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch label="Sound alerts" checked={false} onChange={onChange} disabled />);
    await user.click(toggle());
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards its ref and attributes to the toggle, and className to the row', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref} label="Sound" checked={false} onChange={() => {}} className="mine" name="sound" />);
    expect(ref.current).toBe(toggle());
    expect(toggle().getAttribute('name')).toBe('sound');
    expect(toggle().closest('label')?.className).toBe('ps-switch mine');
  });
});
