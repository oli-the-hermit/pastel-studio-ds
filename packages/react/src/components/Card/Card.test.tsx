import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardHeader, PanelHeader } from './Card';

describe('Card', () => {
  it('forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref} className="mine" data-id="7">Body</Card>);
    expect(ref.current?.className).toBe('ps-card mine');
    expect(ref.current?.dataset.id).toBe('7');
    expect(ref.current?.textContent).toBe('Body');
  });
});

describe('CardHeader', () => {
  it('shows the title as a heading, with its tooltip', () => {
    render(<CardHeader title="Weekend errands" titleTooltip="Weekend errands, 5 tasks" />);
    const heading = screen.getByRole('heading', { level: 2, name: 'Weekend errands' });
    expect(heading.className).toBe('ps-card-title');
    expect(heading.getAttribute('title')).toBe('Weekend errands, 5 tasks');
  });

  it('leaves out the parts it is not given', () => {
    const { container } = render(<CardHeader title="Goals" />);
    expect(container.querySelector('.ps-overline, .ps-card-title-row, .ps-card-subtitle-row, .ps-card-header-actions')).toBeNull();
  });

  it('places the overline, addon, subtitle, aside and actions', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <CardHeader
        ref={ref}
        className="mine"
        overline="Today"
        title="Goals"
        titleAddon={<span>2 left</span>}
        subtitle={<span>Home</span>}
        aside={<span>Live</span>}
        actions={<button>Pin</button>}
      />
    );
    const header = ref.current!;
    expect(header.className).toBe('ps-card-header mine');
    expect(header.querySelector('.ps-overline')?.textContent).toBe('Today');
    expect(header.querySelector('.ps-card-title-row')?.textContent).toBe('Goals2 left');
    expect(header.querySelector('.ps-card-subtitle-row')?.textContent).toBe('Home');
    expect(header.querySelector('.ps-card-header-actions')?.textContent).toBe('Pin');
    expect(Array.from(header.children).map((child) => child.textContent)).toEqual(['TodayGoals2 leftHome', 'Live', 'Pin']);
  });
});

describe('PanelHeader', () => {
  it('shows its label and action, and forwards its ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<PanelHeader ref={ref} title="Up next" action={<button>Add</button>} />);
    expect(ref.current?.className).toBe('ps-panel-header');
    expect(ref.current?.querySelector('.ps-panel-header-title')?.textContent).toBe('Up next');
    expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy();
  });
});
