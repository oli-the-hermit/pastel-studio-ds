import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LabelsProvider } from '../../labels';
import { isBlockingOverlayOpen } from '../../lib/overlays';
import { Menu, tidyMenuItems, type MenuItem } from './Menu';

const noop = () => {};
const items = (onSelect: (key: string) => void = noop): MenuItem[] => [
  { key: 'rename', label: 'Rename', onSelect: () => onSelect('rename') },
  { key: 'duplicate', label: 'Duplicate', disabled: true, onSelect: () => onSelect('duplicate') },
  { key: 'div', divider: true },
  { key: 'delete', label: 'Delete', danger: true, onSelect: () => onSelect('delete') },
];

const trigger = () => document.querySelector<HTMLButtonElement>('[aria-haspopup="menu"]')!;
const item = (name: string) => screen.getByRole('menuitem', { name });

describe('Menu', () => {
  it('is a button named "More actions" that opens a menu', async () => {
    const user = userEvent.setup();
    render(<Menu items={items()} />);
    expect(trigger().getAttribute('aria-label')).toBe('More actions');
    expect(trigger().getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('menu')).toBeNull();
    await user.click(trigger());
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('menu')).toBeTruthy();
    expect(screen.getAllByRole('menuitem').map((el) => el.textContent)).toEqual(['Rename', 'Duplicate', 'Delete']);
    expect(screen.getAllByRole('separator')).toHaveLength(1);
  });

  it('puts a header above the items, in its own inset, and none when not given', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Menu items={items()} />);
    await user.click(trigger());
    expect(screen.getByRole('menu').querySelector('.ps-menu-header')).toBeNull();
    rerender(<Menu items={items()} header={<span>Weekend errands</span>} />);
    const header = screen.getByRole('menu').firstElementChild!;
    expect(header.className).toBe('ps-menu-header');
    expect(header.textContent).toBe('Weekend errands');
  });

  it('takes its name from ariaLabel, the labels prop or the provider, in that order', () => {
    const { rerender } = render(<LabelsProvider labels={{ moreActions: 'Más acciones' }}><Menu items={items()} /></LabelsProvider>);
    expect(trigger().getAttribute('aria-label')).toBe('Más acciones');
    rerender(<LabelsProvider labels={{ moreActions: 'Más acciones' }}><Menu items={items()} labels={{ moreActions: 'Row actions' }} /></LabelsProvider>);
    expect(trigger().getAttribute('aria-label')).toBe('Row actions');
    rerender(<Menu items={items()} ariaLabel="List actions" />);
    expect(trigger().getAttribute('title')).toBe('List actions');
  });

  it('picks an item, closes, and leaves a disabled item alone', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<Menu items={items(onSelect)} />);
    await user.click(trigger());
    await user.click(item('Duplicate'));
    expect(onSelect).not.toHaveBeenCalled();
    await user.click(item('Delete'));
    expect(onSelect).toHaveBeenCalledWith('delete');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
  });

  it('moves between items with the arrows, Home and End, skipping disabled ones', async () => {
    const user = userEvent.setup();
    render(<Menu items={items()} />);
    await user.click(trigger());
    item('Rename').focus();
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(item('Delete'));
    await user.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(item('Rename'));
    await user.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(item('Delete'));
    await user.keyboard('{Home}');
    expect(document.activeElement).toBe(item('Rename'));
    await user.keyboard('{End}');
    expect(document.activeElement).toBe(item('Delete'));
  });

  it('closes on Escape and gives focus back to the trigger', async () => {
    const user = userEvent.setup();
    render(<Menu items={items()} />);
    await user.click(trigger());
    item('Rename').focus();
    await user.keyboard('{Escape}');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });

  it('pauses app shortcuts while it is open', async () => {
    const user = userEvent.setup();
    render(<Menu items={items()} />);
    expect(isBlockingOverlayOpen()).toBe(false);
    await user.click(trigger());
    expect(isBlockingOverlayOpen()).toBe(true);
  });
});

describe('tidyMenuItems', () => {
  const action = (key: string): MenuItem => ({ key, label: key, onSelect: noop });
  const divider = (key: string): MenuItem => ({ key, divider: true });

  it('drops what is falsy, and dividers at the start, at the end or doubled', () => {
    const tidy = tidyMenuItems([divider('a'), false, action('one'), divider('b'), null, divider('c'), action('two'), undefined, divider('d')]);
    expect(tidy.map((i) => i.key)).toEqual(['one', 'b', 'two']);
  });

  it('opens a submenu in place, picks a radio row, and goes back with the Back row or ←', async () => {
    const onSpeed = vi.fn();
    const user = userEvent.setup();
    render(
      <Menu
        items={[
          { key: 'speed', label: 'Playback speed', hint: '1×', items: [{ key: '1', label: 'Normal', checked: true, radio: true, onSelect: noop }, { key: '2', label: '2×', checked: false, radio: true, onSelect: () => onSpeed(2) }] },
          { key: 'loop', label: 'Loop', checked: false, keepOpen: true, onSelect: noop },
        ]}
      />
    );
    await user.click(trigger());
    expect(screen.getByRole('menuitemcheckbox', { name: 'Loop' }).getAttribute('aria-checked')).toBe('false');
    await user.click(screen.getByRole('menuitemcheckbox', { name: 'Loop' }));
    expect(screen.getByRole('menu')).toBeTruthy();
    await user.click(screen.getByRole('menuitem', { name: /Playback speed/ }));
    expect(screen.getByRole('menuitemradio', { name: 'Normal' }).getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(screen.getByRole('menuitem', { name: 'Back: Playback speed' }));
    await user.click(screen.getByRole('menuitem', { name: 'Back: Playback speed' }));
    expect(screen.queryByRole('menuitemradio')).toBeNull();
    screen.getByRole('menuitem', { name: /Playback speed/ }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('menuitemradio', { name: '2×' })).toBeTruthy();
    await user.keyboard('{ArrowLeft}');
    expect(screen.queryByRole('menuitemradio')).toBeNull();
    await user.click(screen.getByRole('menuitem', { name: /Playback speed/ }));
    await user.click(screen.getByRole('menuitemradio', { name: '2×' }));
    expect(onSpeed).toHaveBeenCalledWith(2);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('takes the dock color over video', async () => {
    const user = userEvent.setup();
    render(<Menu items={items()} surface="overlay" />);
    await user.click(trigger());
    expect(screen.getByRole('menu').className).toContain('ps-menu--overlay');
  });
});
