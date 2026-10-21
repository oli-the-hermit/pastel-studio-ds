import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell, AppShellPage } from './AppShell';

const nav = <nav aria-label="Main" />;

describe('AppShell', () => {
  it('places the drawer, the bar and the page, with the page as the main landmark', () => {
    const { container } = render(
      <AppShell nav={nav} topBar={<header>Title</header>} bottomBar={<div>Player</div>}>
        <p>Page</p>
      </AppShell>
    );
    expect(screen.getByRole('main').textContent).toBe('Page');
    const frame = container.querySelector('.ps-app-shell-frame')!;
    expect([...frame.children].map((c) => c.className)).toEqual(['ps-app-shell-nav', 'ps-app-shell-column']);
    const column = frame.querySelector('.ps-app-shell-column')!;
    expect([...column.children].map((c) => c.className)).toEqual(['ps-app-shell-top', 'ps-app-shell-body', 'ps-app-shell-bottom']);
    expect(column.querySelector('.ps-app-shell-top')?.textContent).toBe('Title');
  });

  it('shows the side panel only while it is open', () => {
    const { rerender } = render(<AppShell nav={nav} topBar={null} aside={<div>Queue</div>}><p>Page</p></AppShell>);
    expect(screen.queryByText('Queue')).toBeNull();
    rerender(<AppShell nav={nav} topBar={null} aside={<div>Queue</div>} asideOpen><p>Page</p></AppShell>);
    expect(screen.getByText('Queue')).toBeTruthy();
  });

  it('renders overlays inside the shell, after the frame', () => {
    const { container } = render(<AppShell nav={nav} topBar={null} overlays={<div role="status">Saved</div>}><p>Page</p></AppShell>);
    const shell = container.querySelector('.ps-app-shell')!;
    expect(shell.lastElementChild?.getAttribute('role')).toBe('status');
  });

  it('says whether the page is solid or transparent, and forwards the ref and attributes', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { rerender } = render(<AppShell ref={ref} nav={nav} topBar={null} data-tour="shell"><p>Page</p></AppShell>);
    expect(ref.current?.getAttribute('data-surface')).toBe('solid');
    expect(ref.current?.getAttribute('data-tour')).toBe('shell');
    rerender(<AppShell ref={ref} nav={nav} topBar={null} surface="transparent"><p>Page</p></AppShell>);
    expect(ref.current?.getAttribute('data-surface')).toBe('transparent');
  });
});

describe('AppShellPage', () => {
  it('marks the active page and keeps the inactive ones mounted', () => {
    render(
      <>
        <AppShellPage active id="a">One</AppShellPage>
        <AppShellPage active={false} fill id="b">Two</AppShellPage>
      </>
    );
    expect(screen.getByText('One').classList.contains('is-active')).toBe(true);
    const two = screen.getByText('Two', { ignore: 'none' });
    expect(two.classList.contains('is-active')).toBe(false);
    expect(two.classList.contains('ps-app-shell-page--fill')).toBe(true);
    expect(two.id).toBe('b');
  });
});
