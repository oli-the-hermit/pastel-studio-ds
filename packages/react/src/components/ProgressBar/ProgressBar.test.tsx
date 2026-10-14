import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

const bar = () => screen.getByRole('progressbar');
const fill = () => bar().firstElementChild as HTMLElement;

describe('ProgressBar', () => {
  it('is a named progressbar from 0 to 100', () => {
    render(<ProgressBar value={42.4} label="Exporting report" />);
    expect(screen.getByRole('progressbar', { name: 'Exporting report' })).toBe(bar());
    expect(bar().getAttribute('aria-valuemin')).toBe('0');
    expect(bar().getAttribute('aria-valuemax')).toBe('100');
    expect(bar().getAttribute('aria-valuenow')).toBe('42');
    expect(bar().className).toBe('ps-progress-bar');
    expect(fill().style.width).toBe('42.4%');
  });

  it('clamps values outside 0 to 100', () => {
    const { rerender } = render(<ProgressBar value={140} />);
    expect(bar().getAttribute('aria-valuenow')).toBe('100');
    expect(fill().style.width).toBe('100%');
    rerender(<ProgressBar value={-5} />);
    expect(bar().getAttribute('aria-valuenow')).toBe('0');
    expect(fill().style.width).toBe('0%');
  });

  it('has no value while starting: two bars sweep, the first one even with reduced motion', () => {
    const { rerender } = render(<ProgressBar status="starting" value={30} />);
    expect(bar().hasAttribute('aria-valuenow')).toBe(false);
    expect(bar().className).toBe('ps-progress-bar is-starting');
    const sweeps = Array.from(bar().children);
    expect(sweeps.map((child) => child.className)).toEqual(['ps-progress-bar-sweep', 'ps-progress-bar-sweep']);
    expect(sweeps.map((child) => child.hasAttribute('data-ps-keep-motion'))).toEqual([true, false]);
    rerender(<ProgressBar value={30} />);
    expect(fill().className).toBe('ps-progress-bar-fill');
  });

  it('is full when completed, and stops where it was when failed', () => {
    const { rerender } = render(<ProgressBar status="completed" value={80} />);
    expect(bar().className).toBe('ps-progress-bar is-completed');
    expect(bar().getAttribute('aria-valuenow')).toBe('100');
    expect(fill().style.width).toBe('100%');
    rerender(<ProgressBar status="failed" value={60} />);
    expect(bar().className).toBe('ps-progress-bar is-failed');
    expect(bar().getAttribute('aria-valuenow')).toBe('60');
    expect(fill().style.width).toBe('60%');
  });

  it('forwards its ref, size, className and other attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<ProgressBar ref={ref} value={10} size="lg" className="mine" aria-labelledby="title" />);
    expect(ref.current).toBe(bar());
    expect(bar().className).toBe('ps-progress-bar ps-progress-bar--lg mine');
    expect(bar().getAttribute('aria-labelledby')).toBe('title');
  });
});
