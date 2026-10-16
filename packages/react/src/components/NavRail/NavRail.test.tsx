import React from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { NavRail, type NavRailItem } from './NavRail';
import { useDrawer } from './useDrawer';

const items: NavRailItem[] = [
  { key: 'home', label: 'Home', icon: <svg /> },
  { key: 'rewards', label: 'Rewards', icon: <svg />, badge: 2, badgeLabel: '2 ready to claim' },
];
const brand = { mark: <svg />, name: 'Focus Space' };

describe('NavRail', () => {
  it('is a named nav with the current page marked, tooltips and a labelled badge', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<NavRail label="Main" items={items} activeKey="home" onSelect={onSelect} brand={brand} />);
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeTruthy();
    const home = screen.getByRole('button', { name: 'Home' });
    expect(home.getAttribute('aria-current')).toBe('page');
    expect(home.getAttribute('title')).toBe('Home');
    expect(home.querySelector('.ps-nav-rail-pill')).toBeTruthy();
    expect(screen.getByLabelText('2 ready to claim').textContent).toBe('2');
    await user.click(screen.getByRole('button', { name: /Rewards/ }));
    expect(onSelect).toHaveBeenCalledWith('rewards');
  });

  it('makes the mark the toggle, worded for what it will do', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(<NavRail label="Main" items={items} activeKey="home" onSelect={() => {}} brand={brand} onToggle={onToggle} />);
    await user.click(screen.getByRole('button', { name: 'Expand menu' }));
    expect(onToggle).toHaveBeenCalled();
    rerender(<NavRail label="Main" items={items} activeKey="home" onSelect={() => {}} brand={brand} onToggle={onToggle} variant="expanded" labels={{ collapseMenu: 'Contraer' }} />);
    expect(screen.getByRole('button', { name: 'Contraer' }).getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByText('Focus Space')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Home' }).getAttribute('title')).toBeNull();
  });
});

describe('useDrawer', () => {
  it('remembers the choice, and stays a rail where there is no room', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: true, addEventListener: () => {}, removeEventListener: () => {} });
    vi.stubGlobal('matchMedia', matchMedia);
    const { result } = renderHook(() => useDrawer('test-drawer'));
    expect(result.current).toMatchObject({ canExpand: true, expanded: false });
    act(() => result.current.toggle());
    expect(result.current.expanded).toBe(true);
    expect(window.localStorage.getItem('test-drawer')).toBe('expanded');
    matchMedia.mockReturnValue({ matches: false, addEventListener: () => {}, removeEventListener: () => {} });
    const narrow = renderHook(() => useDrawer('test-drawer'));
    expect(narrow.result.current).toMatchObject({ canExpand: false, expanded: false });
    vi.unstubAllGlobals();
  });
});
