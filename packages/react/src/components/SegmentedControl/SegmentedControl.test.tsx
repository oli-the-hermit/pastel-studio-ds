import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

const options = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

function Range({ onChange = () => {} }: { onChange?: (v: string) => void }) {
  const [value, setValue] = useState('week');
  return <SegmentedControl ariaLabel="Range" options={options} value={value} onChange={(v) => { setValue(v); onChange(v); }} />;
}

const radio = (name: string) => screen.getByRole('radio', { name });

describe('SegmentedControl', () => {
  it('is a named radio group with one checked option and one tab stop', () => {
    render(<Range />);
    expect(screen.getByRole('radiogroup', { name: 'Range' }).className).toBe('ps-segmented-control');
    expect(radio('Week').getAttribute('aria-checked')).toBe('true');
    expect(radio('Week').className).toBe('ps-segmented-control-option is-selected');
    expect(['Day', 'Week', 'Month'].map((n) => radio(n).tabIndex)).toEqual([-1, 0, -1]);
  });

  it('selects with a click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Range onChange={onChange} />);
    await user.click(radio('Month'));
    expect(onChange).toHaveBeenCalledWith('month');
    expect(radio('Month').getAttribute('aria-checked')).toBe('true');
  });

  it('moves and selects with the arrows, Home and End, stopping at the ends', async () => {
    const user = userEvent.setup();
    render(<Range />);
    radio('Week').focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(radio('Month'));
    expect(radio('Month').getAttribute('aria-checked')).toBe('true');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(radio('Month'));
    await user.keyboard('{Home}');
    expect(radio('Day').getAttribute('aria-checked')).toBe('true');
    await user.keyboard('{End}');
    expect(radio('Month').getAttribute('aria-checked')).toBe('true');
    await user.keyboard('{ArrowUp}');
    expect(radio('Week').getAttribute('aria-checked')).toBe('true');
  });

  it('gives the tab stop to the first option when nothing matches', () => {
    render(<SegmentedControl ariaLabel="Range" options={options} value="year" onChange={() => {}} />);
    expect(screen.getAllByRole('radio').map((r) => r.tabIndex)).toEqual([0, -1, -1]);
    expect(screen.getAllByRole('radio').every((r) => r.getAttribute('aria-checked') === 'false')).toBe(true);
  });

  it('turns size and surface into classes and passes other attributes', () => {
    render(<SegmentedControl ariaLabel="Theme" options={options} value="day" onChange={() => {}} size="lg" surface={1} className="mine" data-id="7" />);
    const group = screen.getByRole('radiogroup');
    expect(group.className).toBe('ps-segmented-control ps-segmented-control--lg is-on-1 mine');
    expect(group.dataset.id).toBe('7');
  });
});
