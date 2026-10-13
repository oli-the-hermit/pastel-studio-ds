import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextButton } from './TextButton';

const button = () => screen.getByRole('button');

describe('TextButton', () => {
  it('is a plain button named by its text', () => {
    render(<TextButton>Skip for now</TextButton>);
    expect(screen.getByRole('button', { name: 'Skip for now' })).toBe(button());
    expect(button().getAttribute('type')).toBe('button');
    expect(button().className).toBe('ps-text-button');
  });

  it('turns its props into classes', () => {
    render(<TextButton accent size="xs" surface={3}>+3 more</TextButton>);
    expect(button().className).toBe('ps-text-button ps-text-button--accent ps-text-button--xs is-on-3');
  });

  it('forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<TextButton ref={ref} className="mine" aria-expanded={false}>Show details</TextButton>);
    expect(ref.current).toBe(button());
    expect(button().className).toBe('ps-text-button mine');
    expect(button().getAttribute('aria-expanded')).toBe('false');
  });

  it('is pressed with a click, Enter and Space', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<TextButton onClick={onClick}>Skip for now</TextButton>);
    await user.click(button());
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});
