import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs, type TabItem } from './Tabs';

const tabs: TabItem[] = [
  { key: 'a', label: 'Notifications' },
  { key: 'b', label: 'Music', icon: <svg data-testid="icon" /> },
  { key: 'c', label: 'Updates' },
];

describe('Tabs', () => {
  it('is a named tab list whose active tab labels the panel and controls it', () => {
    render(<Tabs tabs={tabs} value="b" onChange={() => {}} ariaLabel="Settings"><p>Music settings</p></Tabs>);
    expect(screen.getByRole('tablist', { name: 'Settings' })).toBeTruthy();
    const music = screen.getByRole('tab', { name: 'Music' });
    expect(music.getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Updates' }).getAttribute('aria-selected')).toBe('false');
    const panel = screen.getByRole('tabpanel', { name: 'Music' });
    expect(music.getAttribute('aria-controls')).toBe(panel.id);
    expect(panel.textContent).toBe('Music settings');
    expect(screen.getByTestId('icon')).toBeTruthy();
  });

  it('has one tab stop, the active tab, and the panel can take focus', () => {
    render(<Tabs tabs={tabs} value="c" onChange={() => {}} ariaLabel="Settings"><p>Updates</p></Tabs>);
    expect(screen.getAllByRole('tab').map((t) => t.tabIndex)).toEqual([-1, -1, 0]);
    expect(screen.getByRole('tabpanel').tabIndex).toBe(0);
  });

  it('squares the panel\'s top-left corner only while the first tab is active', () => {
    const { rerender } = render(<Tabs tabs={tabs} value="a" onChange={() => {}} ariaLabel="Settings"><p /></Tabs>);
    expect(screen.getByRole('tabpanel').classList.contains('is-at-start')).toBe(true);
    rerender(<Tabs tabs={tabs} value="b" onChange={() => {}} ariaLabel="Settings"><p /></Tabs>);
    expect(screen.getByRole('tabpanel').classList.contains('is-at-start')).toBe(false);
  });

  it('opens a tab on click, and moves and opens with the arrows (wrapping), Home and End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} value="a" onChange={onChange} ariaLabel="Settings"><p /></Tabs>);
    await user.click(screen.getByRole('tab', { name: 'Updates' }));
    expect(onChange).toHaveBeenLastCalledWith('c');
    screen.getByRole('tab', { name: 'Notifications' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('b');
    expect(document.activeElement).toBe(screen.getByRole('tab', { name: 'Music' }));
    screen.getByRole('tab', { name: 'Notifications' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('c');
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('a');
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('c');
  });

  it('falls back to the first tab when the value names none, and forwards the ref', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Tabs ref={ref} tabs={tabs} value="zzz" onChange={() => {}} ariaLabel="Settings" data-tour="tabs"><p /></Tabs>);
    expect(screen.getByRole('tab', { name: 'Notifications' }).getAttribute('aria-selected')).toBe('true');
    expect(ref.current?.getAttribute('data-tour')).toBe('tabs');
  });
});
