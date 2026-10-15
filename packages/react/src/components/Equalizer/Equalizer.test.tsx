import React, { createRef } from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Equalizer } from './Equalizer';

describe('Equalizer', () => {
  it('draws three hidden bars that bounce only while playing', () => {
    const ref = createRef<HTMLSpanElement>();
    const { rerender } = render(<Equalizer ref={ref} />);
    expect(ref.current?.className).toBe('ps-equalizer');
    expect(ref.current?.getAttribute('aria-hidden')).toBe('true');
    expect(ref.current?.children).toHaveLength(3);
    rerender(<Equalizer ref={ref} playing size={20} className="mine" />);
    expect(ref.current?.className).toBe('ps-equalizer is-playing mine');
    expect(ref.current?.style.width).toBe('20px');
    expect(ref.current?.style.height).toBe('20px');
  });
});
