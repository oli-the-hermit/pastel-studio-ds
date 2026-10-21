import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AccountMenu, type AccountView } from './AccountMenu';

const views: AccountView[] = [
  { key: 'profile', label: 'Profile', render: () => <p>Profile form</p> },
  { key: 'appearance', label: 'Appearance', title: 'Look and feel', render: () => <p>Appearance panel</p> },
];
const profile = { name: 'Sam Rivera', handle: '@sam' };

describe('AccountMenu', () => {
  it('is a badge named for the profile, with initials, and the name and chevron only when expanded', () => {
    const { rerender, container } = render(<AccountMenu profile={profile} views={views} exit={{ label: 'Sign out', onSelect: () => {} }} />);
    const badge = screen.getByRole('button', { name: 'Sam Rivera' });
    expect(badge.getAttribute('aria-haspopup')).toBe('menu');
    expect(badge.textContent).toContain('SR');
    expect(container.querySelector('.ps-account-menu-name')?.textContent).toBe('Sam Rivera');
    rerender(<AccountMenu profile={profile} compact views={views} exit={{ label: 'Sign out', onSelect: () => {} }} />);
    expect(container.querySelector('.ps-account-menu-name')).toBeNull();
    expect(container.querySelector('.ps-account-menu--compact')).toBeTruthy();
  });

  it('shows a picture instead of the initials, and the marker with its tooltip', () => {
    const { container } = render(<AccountMenu profile={{ ...profile, avatar: 'me.png', marker: 'Main account' }} views={views} exit={{ label: 'Sign out', onSelect: () => {} }} />);
    expect(container.querySelector('img')?.getAttribute('src')).toBe('me.png');
    expect(container.querySelector('.ps-account-menu-avatar')?.textContent).not.toContain('SR');
    expect(container.querySelector('.ps-account-menu-marker')?.getAttribute('title')).toBe('Main account');
  });

  it('lists who is signed in, the views and the exit, and opens a view in a dialog titled by it', async () => {
    const user = userEvent.setup();
    render(<AccountMenu profile={profile} views={views} exit={{ label: 'Sign out', onSelect: () => {} }} />);
    await user.click(screen.getByRole('button', { name: 'Sam Rivera' }));
    const menu = screen.getByRole('menu');
    expect(within(menu).getByText('@sam')).toBeTruthy();
    expect(within(menu).getAllByRole('menuitem').map((i) => i.textContent)).toEqual(['Profile', 'Appearance', 'Sign out']);
    await user.click(within(menu).getByRole('menuitem', { name: 'Appearance' }));
    const dialog = screen.getByRole('dialog', { name: 'Look and feel' });
    expect(within(dialog).getByText('Appearance panel')).toBeTruthy();
  });

  it('can be controlled from outside', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    const { rerender } = render(<AccountMenu profile={profile} views={views} exit={{ label: 'Sign out', onSelect: () => {} }} view="profile" onViewChange={onViewChange} />);
    expect(screen.getByRole('dialog', { name: 'Profile' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(onViewChange).toHaveBeenCalledWith(null);
    // Controlled: it stays open until the owner says otherwise.
    expect(screen.getByRole('dialog', { name: 'Profile' })).toBeTruthy();
    rerender(<AccountMenu profile={profile} views={views} exit={{ label: 'Sign out', onSelect: () => {} }} view="appearance" onViewChange={onViewChange} />);
    expect(screen.getByRole('dialog', { name: 'Look and feel' })).toBeTruthy();
  });

  it('runs the exit once, disabled until it finishes', async () => {
    const user = userEvent.setup();
    let finish = () => {};
    const onSelect = vi.fn(() => new Promise<void>((r) => { finish = r; }));
    render(<AccountMenu profile={profile} views={views} exit={{ label: 'Sign out', onSelect }} />);
    await user.click(screen.getByRole('button', { name: 'Sam Rivera' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(onSelect).toHaveBeenCalledOnce();
    await user.click(screen.getByRole('button', { name: 'Sam Rivera' }));
    expect(screen.getByRole('menuitem', { name: 'Sign out' }).hasAttribute('disabled') || screen.getByRole('menuitem', { name: 'Sign out' }).getAttribute('aria-disabled') === 'true').toBe(true);
    await act(async () => finish());
  });
});
