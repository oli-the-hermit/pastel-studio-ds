import React, { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('shows its message, with its size as a class', () => {
    const ref = createRef<HTMLDivElement>();
    const { rerender } = render(<EmptyState ref={ref}>No sessions yet.</EmptyState>);
    expect(ref.current?.className).toBe('ps-empty-state');
    expect(ref.current?.textContent).toBe('No sessions yet.');
    rerender(<EmptyState ref={ref} size="sm" className="mine">None</EmptyState>);
    expect(ref.current?.className).toBe('ps-empty-state ps-empty-state--sm mine');
  });
});
