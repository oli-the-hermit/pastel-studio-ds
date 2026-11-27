import React, { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FilterChips } from './FilterChips';

type Kind = 'albums' | 'artists' | 'songs';
const options: { value: Kind; label: string; count?: number }[] = [
  { value: 'albums', label: 'Albums', count: 12 },
  { value: 'artists', label: 'Artists' },
  { value: 'songs', label: 'Songs', count: 0 },
];

function Show({ onChange = () => {} }: { onChange?: (v: Kind) => void }) {
  const [value, setValue] = useState<Kind>('artists');
  return <FilterChips ariaLabel="Show" options={options} value={value} onChange={(v) => { setValue(v); onChange(v); }} />;
}

const chip = (name: RegExp) => screen.getByRole('radio', { name });
const chips = () => screen.getAllByRole('radio');

describe('FilterChips', () => {
  it('is a named radio group with one chosen chip and one tab stop', () => {
    render(<Show />);
    expect(screen.getByRole('radiogroup', { name: 'Show' }).className).toBe('ps-filter-chips');
    expect(chips().map((c) => c.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false']);
    expect(chip(/Artists/).className).toBe('ps-filter-chips-option is-selected');
    expect(chips().map((c) => c.tabIndex)).toEqual([-1, 0, -1]);
    expect(chips().every((c) => c.getAttribute('type') === 'button')).toBe(true);
  });

  it('shows a count after the label when one is given, zero too', () => {
    render(<Show />);
    expect(chip(/Albums/).querySelector('.ps-filter-chips-count')?.textContent).toBe('12');
    expect(chip(/Albums/).textContent).toBe('Albums12');
    expect(chip(/Artists/).querySelector('.ps-filter-chips-count')).toBeNull();
    expect(chip(/Songs/).querySelector('.ps-filter-chips-count')?.textContent).toBe('0');
  });

  it('chooses with a click', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Show onChange={onChange} />);
    await user.click(chip(/Songs/));
    expect(onChange).toHaveBeenCalledWith('songs');
    expect(chips().map((c) => c.getAttribute('aria-checked'))).toEqual(['false', 'false', 'true']);
  });

  it('moves and chooses with the arrows, Home and End, stopping at the ends', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Show onChange={onChange} />);
    chip(/Artists/).focus();
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(chip(/Songs/));
    expect(chip(/Songs/).getAttribute('aria-checked')).toBe('true');
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(chip(/Songs/));
    expect(onChange).toHaveBeenCalledTimes(1);
    await user.keyboard('{Home}');
    expect(chip(/Albums/).getAttribute('aria-checked')).toBe('true');
    await user.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(chip(/Albums/));
    await user.keyboard('{End}');
    expect(chip(/Songs/).getAttribute('aria-checked')).toBe('true');
    await user.keyboard('{ArrowUp}');
    expect(chip(/Artists/).getAttribute('aria-checked')).toBe('true');
    await user.keyboard('{ArrowDown}');
    expect(chip(/Songs/).getAttribute('aria-checked')).toBe('true');
    expect(chips().map((c) => c.tabIndex)).toEqual([-1, -1, 0]);
  });

  it('gives the tab stop to the first chip when nothing matches', () => {
    render(<FilterChips ariaLabel="Show" options={options} value={'films' as Kind} onChange={() => {}} />);
    expect(chips().map((c) => c.tabIndex)).toEqual([0, -1, -1]);
    expect(chips().every((c) => c.getAttribute('aria-checked') === 'false')).toBe(true);
  });

  it('turns its size into a class and passes other attributes', () => {
    render(<FilterChips ariaLabel="Show" options={options} value="albums" onChange={() => {}} size="lg" className="mine" data-id="7" />);
    const group = screen.getByRole('radiogroup');
    expect(group.className).toBe('ps-filter-chips ps-filter-chips--lg mine');
    expect(group.dataset.id).toBe('7');
  });
});
