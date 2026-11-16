import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WindowFrame } from './WindowFrame';

const DRAG = { 'data-tauri-drag-region': true };

describe('WindowFrame', () => {
  it('puts a bar with the window buttons at its end above the screen', () => {
    const { container } = render(
      <WindowFrame windowControls={<div data-testid="controls" />}>
        <main>Sign in</main>
      </WindowFrame>
    );
    const frame = container.querySelector('.ps-window-frame')!;
    expect([...frame.children].map((c) => c.className)).toEqual(['ps-window-frame-bar', 'ps-window-frame-body']);
    const bar = frame.firstElementChild!;
    expect(bar.lastElementChild?.className).toBe('ps-window-frame-controls');
    expect(screen.getByTestId('controls')).toBeTruthy();
    expect(screen.getByRole('main').textContent).toBe('Sign in');
  });

  it('spreads the drag attributes on the bar and its free space, not on the buttons or the screen', () => {
    const { container } = render(
      <WindowFrame dragRegionProps={DRAG} windowControls={<button>Close</button>}>
        <main>Sign in</main>
      </WindowFrame>
    );
    const dragged = [...container.querySelectorAll('[data-tauri-drag-region]')].map((el) => el.className);
    expect(dragged).toEqual(['ps-window-frame-bar', 'ps-window-frame-space']);
  });

  it('leaves out the buttons when it has none', () => {
    const { container } = render(<WindowFrame><main>Starting</main></WindowFrame>);
    expect(container.querySelector('.ps-window-frame-controls')).toBeNull();
    expect(container.querySelector('.ps-window-frame-space')).toBeTruthy();
  });
});
