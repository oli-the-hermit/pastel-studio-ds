import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ColorSwatchGrid, type SwatchOption } from './ColorSwatchGrid';

const options: SwatchOption[] = ['Sage', 'Mint', 'Sky', 'Blush', 'Peach'].map((label) => ({
  value: label.toLowerCase(), label, color: '#AACCAA', onColor: '#102010',
}));

describe('ColorSwatchGrid', () => {
  it('is a named radio group of named swatches, with the selected one checked', () => {
    render(<ColorSwatchGrid options={options} value="sky" onChange={() => {}} ariaLabel="Calm" />);
    expect(screen.getByRole('radiogroup', { name: 'Calm' })).toBeTruthy();
    const sky = screen.getByRole('radio', { name: 'Sky' });
    expect(sky.getAttribute('aria-checked')).toBe('true');
    expect(sky.getAttribute('title')).toBe('Sky');
    expect(sky.querySelector('svg')).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'Mint' }).querySelector('svg')).toBeNull();
  });

  it('draws each swatch in its own colors and lays out the columns asked for', () => {
    const { container } = render(<ColorSwatchGrid options={options} value="sky" onChange={() => {}} ariaLabel="Calm" columns={3} />);
    expect((container.firstChild as HTMLElement).style.getPropertyValue('--ps-color-swatch-columns')).toBe('3');
    const sky = screen.getByRole('radio', { name: 'Sky' });
    expect(sky.style.getPropertyValue('--ps-color-swatch-fill')).toBe('#AACCAA');
    expect(sky.style.getPropertyValue('--ps-color-swatch-ink')).toBe('#102010');
  });

  it('has one tab stop, the selected swatch, or the first when nothing here is selected', () => {
    const { rerender } = render(<ColorSwatchGrid options={options} value="blush" onChange={() => {}} ariaLabel="Calm" />);
    expect(screen.getAllByRole('radio').map((r) => r.tabIndex)).toEqual([-1, -1, -1, 0, -1]);
    rerender(<ColorSwatchGrid options={options} value={null} onChange={() => {}} ariaLabel="Calm" />);
    expect(screen.getAllByRole('radio').map((r) => r.tabIndex)).toEqual([0, -1, -1, -1, -1]);
  });

  it('selects with a click, and moves and selects with the arrow keys, Home and End', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ColorSwatchGrid options={options} value="sage" onChange={onChange} ariaLabel="Calm" columns={2} />);
    await user.click(screen.getByRole('radio', { name: 'Peach' }));
    expect(onChange).toHaveBeenLastCalledWith('peach');
    screen.getByRole('radio', { name: 'Sage' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('mint');
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Mint' }));
    screen.getByRole('radio', { name: 'Sage' }).focus();
    await user.keyboard('{ArrowDown}');
    expect(onChange).toHaveBeenLastCalledWith('sky');
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('peach');
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('sage');
  });

  it('forwards the ref and other attributes', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ColorSwatchGrid ref={ref} options={options} value={null} onChange={() => {}} ariaLabel="Calm" data-tour="swatches" />);
    expect(ref.current?.getAttribute('data-tour')).toBe('swatches');
  });
});
