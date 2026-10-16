import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppLayout } from './AppLayout';

describe('AppLayout', () => {
  it('places each slot, with the page as the main landmark', () => {
    const { container } = render(
      <AppLayout appBar={<div>Menus</div>} nav={<nav aria-label="Main" />} topBar={<div>Title</div>} aside={<div>Queue</div>} asideOpen bottomBar={<div>Player</div>}>
        <p>Page</p>
      </AppLayout>
    );
    expect(screen.getByRole('main').textContent).toBe('Page');
    expect(container.querySelector('.ps-app-layout > .ps-app-layout-app-bar')?.textContent).toBe('Menus');
    const grid = container.querySelector('.ps-app-layout-grid')!;
    expect([...grid.children].map((c) => c.className)).toEqual(['ps-app-layout-nav', 'ps-app-layout-top', 'ps-app-layout-main', 'ps-app-layout-aside', 'ps-app-layout-bottom']);
  });

  it('leaves out the side panel while it is closed', () => {
    render(<AppLayout aside={<div>Queue</div>}><p>Page</p></AppLayout>);
    expect(screen.queryByText('Queue')).toBeNull();
  });
});
