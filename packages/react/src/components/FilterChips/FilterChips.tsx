import React, { useRef } from 'react';
import { cx } from '../../lib/cx';
import { radioKeyTarget } from '../../lib/radioKeys';

export interface FilterChipOption<T extends string> {
  value: T;
  label: React.ReactNode;
  /** How many items the filter shows, as a quieter number after the label. */
  count?: number;
}

export interface FilterChipsProps<T extends string> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'role'> {
  options: FilterChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** The group's accessible name, e.g. "Show". */
  ariaLabel: string;
  /** `md` (default) over a list or a grid, `lg` where the chips are the page's main control. */
  size?: 'md' | 'lg';
}

/**
 * A row of separate chips that filter what a list or a grid shows; one is always chosen. A radio
 * group: one tab stop; the arrow keys move and choose, Home and End jump to the ends. The chips
 * wrap to more lines when the row is short of room.
 */
export const FilterChips = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  className,
  ...rest
}: FilterChipsProps<T>): React.ReactElement => {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = options.findIndex((o) => o.value === value);
  const tabStop = selected >= 0 ? selected : 0;

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const target = radioKeyTarget(e.key, i, options.length, 1);
    if (target === null) return;
    e.preventDefault();
    if (target === i) return;
    refs.current[target]?.focus();
    onChange(options[target].value);
  };

  return (
    <div className={cx('ps-filter-chips', size === 'lg' && 'ps-filter-chips--lg', className)} role="radiogroup" aria-label={ariaLabel} {...rest}>
      {options.map((o, i) => {
        const checked = i === selected;
        return (
          <button
            key={o.value}
            ref={(el) => { refs.current[i] = el; }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={i === tabStop ? 0 : -1}
            className={cx('ps-filter-chips-option', checked && 'is-selected')}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {o.label}
            {o.count !== undefined && <span className="ps-filter-chips-count">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
};
