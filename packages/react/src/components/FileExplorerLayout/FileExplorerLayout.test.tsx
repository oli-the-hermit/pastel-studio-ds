import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FileExplorerLayout } from './FileExplorerLayout';

const parts = {
  navigation: <button type="button">Back</button>,
  address: <input aria-label="Address" />,
  search: <input aria-label="Search" />,
  tree: <ul aria-label="Folders" />,
  commands: <button type="button">New</button>,
  status: <span>3 items</span>,
  details: <aside aria-label="Details">Cover.png</aside>,
};

describe('FileExplorerLayout', () => {
  it('puts each part where it belongs, under its name', () => {
    const { container } = render(<FileExplorerLayout {...parts} detailsOpen contentLabel="Music"><div>tiles</div></FileExplorerLayout>);
    expect(screen.getByRole('toolbar', { name: 'Navigation' }).textContent).toBe('Back');
    expect(screen.getByRole('navigation', { name: 'Navigation pane' }).querySelector('[aria-label="Folders"]')).toBeTruthy();
    const content = screen.getByRole('region', { name: 'Music' });
    expect(content.contains(screen.getByRole('toolbar', { name: 'Commands' }))).toBe(true);
    expect(content.textContent).toContain('tiles');
    expect(content.textContent).toContain('3 items');
    expect(screen.getByRole('complementary', { name: 'Details' })).toBeTruthy();
    expect(container.firstElementChild?.className).toBe('ps-file-explorer-layout is-details-open');
  });

  it('without a tree, the content takes its place', () => {
    const { container } = render(<FileExplorerLayout navigation={parts.navigation} search={parts.search} contentLabel="Feed"><div /></FileExplorerLayout>);
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(screen.queryByRole('toolbar', { name: 'Commands' })).toBeNull();
    expect(container.firstElementChild?.classList.contains('is-treeless')).toBe(true);
  });

  it('shows the details only while open', () => {
    const { rerender } = render(<FileExplorerLayout {...parts} contentLabel="Music"><div /></FileExplorerLayout>);
    expect(screen.queryByRole('complementary')).toBeNull();
    rerender(<FileExplorerLayout {...parts} detailsOpen contentLabel="Music"><div /></FileExplorerLayout>);
    expect(screen.getByRole('complementary', { name: 'Details' })).toBeTruthy();
  });
});
