import React, { createRef } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TOOLTIP_DELAY } from '../Tooltip';
import { IconButton, iconButtonClass } from './IconButton';

const button = () => screen.getByRole('button');

describe('IconButton', () => {
  it('takes its name and its tooltip from the label, with no native title', () => {
    vi.useFakeTimers();
    render(<IconButton label="Delete task"><svg /></IconButton>);
    expect(screen.getByRole('button', { name: 'Delete task' })).toBe(button());
    expect(button().hasAttribute('title')).toBe(false);
    expect(button().getAttribute('type')).toBe('button');
    fireEvent.pointerEnter(button());
    act(() => void vi.advanceTimersByTime(TOOLTIP_DELAY));
    expect(screen.getByRole('tooltip').textContent).toBe('Delete task');
    vi.useRealTimers();
  });

  it('lets a title replace the tooltip without changing the name, and shows a shortcut and description', () => {
    vi.useFakeTimers();
    render(<IconButton label="Delete task" title="Delete" shortcut="Del" description="Moves it to the Trash"><svg /></IconButton>);
    expect(button().getAttribute('aria-label')).toBe('Delete task');
    expect(button().getAttribute('aria-keyshortcuts')).toBe('Delete');
    fireEvent.pointerEnter(button());
    act(() => void vi.advanceTimersByTime(TOOLTIP_DELAY));
    const tip = screen.getByRole('tooltip');
    expect(tip.textContent).toBe('DeleteDelMoves it to the Trash');
    expect(document.getElementById(button().getAttribute('aria-describedby')!)?.textContent).toBe('Moves it to the Trash');
    vi.useRealTimers();
  });

  it('keeps the native title when its tooltip is turned off', () => {
    render(<IconButton label="Delete" title="Delete it" tooltip={false}><svg /></IconButton>);
    expect(button().getAttribute('title')).toBe('Delete it');
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
