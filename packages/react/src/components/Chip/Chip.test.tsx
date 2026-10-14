import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Chip } from './Chip';

describe('Chip', () => {
  it('turns its tone into a class', () => {
    const { rerender } = render(<Chip>Home</Chip>);
    expect(screen.getByText('Home').className).toBe('ps-chip');
    rerender(<Chip tone="accent">Home</Chip>);
    expect(screen.getByText('Home').className).toBe('ps-chip ps-chip--accent');
  });

  it('forwards its ref, className and other attributes', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Chip ref={ref} className="mine" title="Weekend errands">Weekend…</Chip>);
    expect(ref.current?.className).toBe('ps-chip mine');
    expect(ref.current?.getAttribute('title')).toBe('Weekend errands');
  });
});
