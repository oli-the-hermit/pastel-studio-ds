import React, { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IconSwap } from './IconSwap';

describe('IconSwap', () => {
  it('holds both icons and shows the one for its state', () => {
    const ref = createRef<HTMLSpanElement>();
    const { rerender } = render(<IconSwap ref={ref} on={false} onIcon={<i>pause</i>} offIcon={<i>play</i>} />);
    expect(ref.current?.className).toBe('ps-icon-swap is-off');
    expect(ref.current?.querySelector('.ps-icon-swap-on')?.textContent).toBe('pause');
    expect(ref.current?.querySelector('.ps-icon-swap-off')?.textContent).toBe('play');
    rerender(<IconSwap ref={ref} on onIcon={<i>pause</i>} offIcon={<i>play</i>} />);
    expect(ref.current?.className).toBe('ps-icon-swap is-on');
  });

  it('is hidden from screen readers and forwards its attributes', () => {
    const { container } = render(<IconSwap on className="mine" data-id="1" onIcon="a" offIcon="b" />);
    const swap = container.firstElementChild as HTMLElement;
    expect(swap.getAttribute('aria-hidden')).toBe('true');
    expect(swap.className).toBe('ps-icon-swap is-on mine');
    expect(swap.dataset.id).toBe('1');
  });
});
