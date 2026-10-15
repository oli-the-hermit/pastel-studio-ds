import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddressBar, type Crumb } from './AddressBar';

const path: Crumb[] = [{ id: 'home', label: 'Home' }, { id: 'music', label: 'Music' }, { id: 'albums', label: 'Albums' }];
const kids = (id: string): Crumb[] => (id === 'music' ? [{ id: 'albums', label: 'Albums' }, { id: 'podcasts', label: 'Podcasts' }] : []);

describe('AddressBar', () => {
  it('lists crumbs with the current folder marked, and opens a crumb on click', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<AddressBar path={path} onNavigate={onNavigate} />);
    expect(screen.getByRole('navigation', { name: 'Address' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Albums' }).getAttribute('aria-current')).toBe('location');
    await user.click(screen.getByRole('button', { name: 'Home' }));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });

  it('lists a folder\'s subfolders from its chevron', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<AddressBar path={path} childrenOf={kids} onNavigate={onNavigate} />);
    await user.click(screen.getByRole('button', { name: 'Folders in Music' }));
    await user.click(screen.getByRole('menuitem', { name: 'Podcasts' }));
    expect(onNavigate).toHaveBeenCalledWith('podcasts');
  });

  it('folds earlier crumbs into a menu past maxVisible', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<AddressBar path={path} onNavigate={onNavigate} maxVisible={1} labels={{ earlierFolders: 'Anteriores' }} />);
    expect(screen.queryByRole('button', { name: 'Home' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Anteriores' }));
    await user.click(screen.getByRole('menuitem', { name: 'Home' }));
    expect(onNavigate).toHaveBeenCalledWith('home');
  });

  it('edits the path on F4 and submits it on Enter; Escape goes back', async () => {
    const user = userEvent.setup();
    const onSubmitPath = vi.fn();
    render(<AddressBar path={path} onNavigate={() => {}} onSubmitPath={onSubmitPath} />);
    screen.getByRole('button', { name: 'Home' }).focus();
    await user.keyboard('{F4}');
    const input = screen.getByRole('textbox', { name: 'Address' }) as HTMLInputElement;
    expect(input.value).toBe('Home\\Music\\Albums');
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('textbox')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Edit path' }));
    await user.click(screen.getByRole('button', { name: 'Edit path' }));
    await user.clear(screen.getByRole('textbox'));
    await user.keyboard('Home{Enter}');
    expect(onSubmitPath).toHaveBeenCalledWith('Home');
  });
});
