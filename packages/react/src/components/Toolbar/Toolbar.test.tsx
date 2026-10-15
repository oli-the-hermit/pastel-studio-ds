import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Toolbar, ToolbarDivider, ToolbarGroup, ToolbarSpacer } from './Toolbar';

const bar = (onKeyDown?: () => void) => (
  <Toolbar label="File commands" onKeyDown={onKeyDown}>
    <ToolbarGroup><button type="button">New</button></ToolbarGroup>
    <ToolbarDivider />
    <ToolbarGroup>
      <button type="button" disabled>Rename</button>
      <button type="button">Copy</button>
    </ToolbarGroup>
    <ToolbarSpacer />
    <input aria-label="Search" />
  </Toolbar>
);

describe('Toolbar', () => {
  it('is a named toolbar with vertical dividers', () => {
    render(bar());
    expect(screen.getByRole('toolbar', { name: 'File commands' }).className).toBe('ps-toolbar');
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical');
  });

  it('moves between enabled buttons with the arrows, wrapping, and leaves inputs alone', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    render(bar(onKeyDown));
    screen.getByText('New').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('Copy'));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByText('New'));
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByText('Copy'));
    screen.getByLabelText('Search').focus();
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(screen.getByLabelText('Search'));
    expect(onKeyDown).toHaveBeenCalled();
  });
});
