import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { MenuItem } from '../Menu';
import { MenuBar, type MenuBarMenu } from './MenuBar';
import { tooltipText } from '../../lib/tooltipTesting';

const noop = () => {};
const items = (prefix: string, onSelect: (key: string) => void = noop): MenuItem[] => [
  { key: `${prefix}-a`, label: `${prefix} one`, onSelect: () => onSelect(`${prefix}-a`) },
  { key: `${prefix}-b`, label: `${prefix} two`, onSelect: () => onSelect(`${prefix}-b`) },
];
const menus = (onSelect?: (key: string) => void): MenuBarMenu[] => [
  { key: 'file', label: 'Studio', brand: true, items: items('File', onSelect) },
  { key: 'edit', label: 'Edit', items: items('Edit', onSelect) },
  { key: 'help', label: 'Help', items: items('Help', onSelect) },
];

const trigger = (name: string) => screen.getByRole('menuitem', { name });
const openMenu = () => screen.queryByRole('menu');

describe('MenuBar', () => {
  it('is a named menubar of menu triggers, one of them in the tab order', () => {
    render(<MenuBar menus={menus()} />);
    expect(screen.getByRole('menubar', { name: 'Menu bar' })).toBeTruthy();
    expect(trigger('Studio').getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger('Studio').tabIndex).toBe(0);
    expect(trigger('Edit').tabIndex).toBe(-1);
    expect(trigger('Studio').classList.contains('ps-menubar-trigger--brand')).toBe(true);
  });

  it('opens a menu on click, picks an item, and closes', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<MenuBar menus={menus(onSelect)} />);
    await user.click(trigger('Edit'));
    expect(trigger('Edit').getAttribute('aria-expanded')).toBe('true');
    expect(openMenu()?.getAttribute('aria-label')).toBe('Edit');
    await user.click(screen.getByRole('menuitem', { name: 'Edit two' }));
    expect(onSelect).toHaveBeenCalledWith('Edit-b');
    expect(openMenu()).toBeNull();
  });

  it('switches menus by pointing at another trigger while one is open', async () => {
    const user = userEvent.setup();
    render(<MenuBar menus={menus()} />);
    await user.hover(trigger('Help'));
    expect(openMenu()).toBeNull();
    await user.click(trigger('Studio'));
    await user.hover(trigger('Help'));
    expect(openMenu()?.getAttribute('aria-label')).toBe('Help');
    expect(trigger('Studio').getAttribute('aria-expanded')).toBe('false');
  });

  it('moves between triggers with the arrow keys and opens with ↓', async () => {
    const user = userEvent.setup();
    render(<MenuBar menus={menus()} />);
    trigger('Studio').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(trigger('Edit'));
    expect(trigger('Edit').tabIndex).toBe(0);
    await user.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(document.activeElement).toBe(trigger('Help'));
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Help one'));
  });

  it('moves to the neighbouring menu with → inside an open menu, and Escape returns to the trigger', async () => {
    const user = userEvent.setup();
    render(<MenuBar menus={menus()} />);
    trigger('Studio').focus();
    await user.keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement?.textContent).toBe('File one'));
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(document.activeElement?.textContent).toBe('Edit one'));
    expect(openMenu()?.getAttribute('aria-label')).toBe('Edit');
    await user.keyboard('{Escape}');
    expect(openMenu()).toBeNull();
    expect(document.activeElement).toBe(trigger('Edit'));
  });

  it('shows only the icon for an icon-only menu, named by its label', () => {
    render(<MenuBar menus={[{ key: 'app', label: 'Pastel Studio', iconOnly: true, icon: <svg />, items: items('App') }]} />);
    const t = trigger('Pastel Studio');
    expect(tooltipText(t)).toBe('Pastel Studio');
    expect(t.textContent).toBe('');
  });
});
