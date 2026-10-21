import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TopBar } from './TopBar';

describe('TopBar', () => {
  it('is a header with the page title as its heading, then the status, the free space and the tools', () => {
    const { container } = render(<TopBar title="Library" status={<span>Playing</span>} tools={<button>Help</button>} />);
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Library');
    const bar = container.querySelector('.ps-top-bar')!;
    expect([...bar.children].map((c) => c.className || c.tagName.toLowerCase())).toEqual(['ps-top-bar-title', 'span', 'ps-top-bar-spacer', 'ps-top-bar-tools']);
  });

  it('leaves out the tools and the window buttons when it has none', () => {
    const { container } = render(<TopBar title="Library" />);
    expect(container.querySelector('.ps-top-bar-tools')).toBeNull();
    expect(container.querySelector('.ps-top-bar-window')).toBeNull();
    expect(container.querySelector('.ps-top-bar--framed')).toBeNull();
  });

  it('puts the window buttons after the tools and tightens the right padding', () => {
    const { container } = render(<TopBar title="Library" tools={<button>Help</button>} windowControls={<div data-testid="controls" />} />);
    const bar = container.querySelector('.ps-top-bar')!;
    expect(bar.classList.contains('ps-top-bar--framed')).toBe(true);
    expect(bar.lastElementChild?.className).toBe('ps-top-bar-window');
    expect(screen.getByTestId('controls')).toBeTruthy();
  });

  it('spreads the drag attributes on the bar, the title and the free space, not on the tools', () => {
    const { container } = render(<TopBar title="Library" tools={<button>Help</button>} dragRegionProps={{ 'data-tauri-drag-region': true }} />);
    const marked = [...container.querySelectorAll('[data-tauri-drag-region]')].map((e) => e.className);
    expect(marked).toEqual(['ps-top-bar', 'ps-top-bar-title', 'ps-top-bar-spacer']);
  });

  it('forwards the ref and other attributes', () => {
    const ref = React.createRef<HTMLElement>();
    render(<TopBar ref={ref} title="Library" data-tour="bar" className="mine" />);
    expect(ref.current?.getAttribute('data-tour')).toBe('bar');
    expect(ref.current?.classList.contains('mine')).toBe(true);
  });
});
