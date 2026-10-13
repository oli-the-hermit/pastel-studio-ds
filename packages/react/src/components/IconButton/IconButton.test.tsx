import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { IconButton, iconButtonClass } from './IconButton';

const button = () => screen.getByRole('button');

describe('IconButton', () => {
  it('takes its name and its tooltip from the label', () => {
    render(<IconButton label="Delete task"><svg /></IconButton>);
    expect(screen.getByRole('button', { name: 'Delete task' })).toBe(button());
    expect(button().getAttribute('title')).toBe('Delete task');
    expect(button().getAttribute('type')).toBe('button');
  });

  it('lets a title replace the tooltip without changing the name', () => {
    render(<IconButton label="Delete task" title="Delete (Del)"><svg /></IconButton>);
    expect(button().getAttribute('aria-label')).toBe('Delete task');
    expect(button().getAttribute('title')).toBe('Delete (Del)');
  });

  it('turns its props into classes', () => {
    render(<IconButton label="Delete" size="xs" tone="danger" active surface={3}><svg /></IconButton>);
    expect(button().className).toBe('ps-icon-button ps-icon-button--xs ps-icon-button--danger is-active is-on-3');
  });

  it('is not a toggle unless pressed is given', () => {
    render(<IconButton label="Queue" active><svg /></IconButton>);
    expect(button().hasAttribute('aria-pressed')).toBe(false);
    expect(button().className).toBe('ps-icon-button is-active');
  });

  it('announces a toggle as on or off, and looks active when on', () => {
    const { rerender } = render(<IconButton label="Mute" pressed><svg /></IconButton>);
    expect(button().getAttribute('aria-pressed')).toBe('true');
    expect(button().className).toBe('ps-icon-button is-active');
    rerender(<IconButton label="Mute" pressed={false}><svg /></IconButton>);
    expect(button().getAttribute('aria-pressed')).toBe('false');
    expect(button().className).toBe('ps-icon-button');
  });

  it('forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} label="Close" className="mine" data-id="42"><svg /></IconButton>);
    expect(ref.current).toBe(button());
    expect(button().className).toBe('ps-icon-button mine');
    expect(button().dataset.id).toBe('42');
  });

  it('is pressed with a click, Enter and Space, and not at all when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<IconButton label="Close" onClick={onClick}><svg /></IconButton>);
    await user.click(button());
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
    rerender(<IconButton label="Close" onClick={onClick} disabled><svg /></IconButton>);
    await user.click(button());
    expect(onClick).toHaveBeenCalledTimes(3);
  });
});

describe('iconButtonClass', () => {
  it('gives the same classes to a trigger that renders its own button', () => {
    expect(iconButtonClass()).toBe('ps-icon-button');
    expect(iconButtonClass({ size: 'sm', active: true, surface: 'accent' })).toBe('ps-icon-button ps-icon-button--sm is-active is-on-accent');
  });
});
