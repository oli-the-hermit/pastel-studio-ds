import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

const button = () => screen.getByRole('button');

describe('Button', () => {
  it('is a plain button named by its text, and never submits a form by accident', () => {
    render(<Button>Save</Button>);
    expect(button().textContent).toBe('Save');
    expect(button().getAttribute('type')).toBe('button');
    expect(button().className).toBe('ps-button');
  });

  it('turns its props into classes', () => {
    render(<Button variant="primary" size="sm" block surface={2}>Save</Button>);
    expect(button().className).toBe('ps-button ps-button--primary ps-button--sm is-block is-on-2');
  });

  it('adds no class for the defaults: secondary, medium, on a card', () => {
    render(<Button variant="secondary" size="md" surface={1}>Save</Button>);
    expect(button().className).toBe('ps-button');
  });

  it('forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref} className="mine" type="submit" data-id="42">Save</Button>);
    expect(ref.current).toBe(button());
    expect(button().className).toBe('ps-button mine');
    expect(button().getAttribute('type')).toBe('submit');
    expect(button().dataset.id).toBe('42');
  });

  it('is pressed with a click, Enter and Space', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(button());
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('cannot be pressed or focused when disabled', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<Button disabled onClick={onClick}>Save</Button>);
    await user.click(button());
    await user.tab();
    expect(onClick).not.toHaveBeenCalled();
    expect(document.activeElement).not.toBe(button());
  });

  it('puts the leading icon before the text and the trailing icon after it', () => {
    render(<Button icon={<svg data-testid="lead" />} trailingIcon={<svg data-testid="trail" />}>Sort by</Button>);
    const [lead, text, trail] = [...button().childNodes];
    expect(lead).toBe(screen.getByTestId('lead'));
    expect(text.textContent).toBe('Sort by');
    expect(trail.contains(screen.getByTestId('trail'))).toBe(true);
  });

  it('wraps its text when collapsible, so phones can hide it and keep the icon', () => {
    render(<Button collapsible icon={<svg />} aria-label="Add task">Add task</Button>);
    expect(button().className).toBe('ps-button is-collapsible');
    expect(button().querySelector('.ps-button-label')?.textContent).toBe('Add task');
    expect(button().getAttribute('aria-label')).toBe('Add task');
  });
});
