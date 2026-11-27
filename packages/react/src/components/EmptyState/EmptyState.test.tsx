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

  it('with a picture and a title, sets the message under them', () => {
    const { container, rerender } = render(
      <EmptyState icon={<svg data-testid="picture" />} title="No videos in this folder">
        It has 12 images. <button type="button">Show everything</button>
      </EmptyState>
    );
    const root = container.firstElementChild as HTMLElement;
    expect([...root.children].map((el) => el.className)).toEqual(['ps-empty-state-icon', 'ps-empty-state-title', 'ps-empty-state-text']);
    expect(root.querySelector('.ps-empty-state-icon svg')).toBeTruthy();
    expect(root.querySelector('.ps-empty-state-title')?.textContent).toBe('No videos in this folder');
    expect(root.querySelector('.ps-empty-state-text button')?.textContent).toBe('Show everything');
    // A title alone: no empty line under it
    rerender(<EmptyState title="Trash is empty" />);
    expect([...(container.firstElementChild as HTMLElement).children].map((el) => el.className)).toEqual(['ps-empty-state-title']);
  });
});
