import React, { useRef } from 'react';
import { cx } from '../../lib/cx';
import { radioKeyTarget } from '../../lib/radioKeys';

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

export interface SegmentedControlProps<T extends string> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'role'> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** The group's accessible name, e.g. "Theme". */
  ariaLabel: string;
  /** `md` (default) for page toolbars, `lg` for settings. */
  size?: 'md' | 'lg';
  /** The surface it sits on, 0 the page (default) or 1 a card or dialog: the track is one step above it. */
  surface?: 0 | 1;
}

/**
 * A row of pill options, one of which is selected. A radio group: one tab stop; the arrow
 * keys move and select, Home and End jump to the ends.
 */
export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  size = 'md',
  surface = 0,
  className,
  ...rest
}: SegmentedControlProps<T>): React.ReactElement => {
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
    <div
      className={cx('ps-segmented-control', size === 'lg' && 'ps-segmented-control--lg', surface === 1 && 'is-on-1', className)}
      role="radiogroup"
      aria-label={ariaLabel}
      {...rest}
    >
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
            className={cx('ps-segmented-control-option', checked && 'is-selected')}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};
