import React, { forwardRef, useRef } from 'react';
import { IconCheck } from '../../icons';
import { cx } from '../../lib/cx';
import { radioKeyTarget } from '../../lib/radioKeys';

export interface SwatchOption {
  value: string;
  /** Accessible name and tooltip. */
  label: string;
  /** The swatch's fill. */
  color: string;
  /** The check mark's color, readable on the fill. */
  onColor: string;
}

export interface ColorSwatchGridProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'role'> {
  options: SwatchOption[];
  /** The selected value; null (or a value not in this grid) selects nothing here. */
  value: string | null;
  onChange: (value: string) => void;
  /** The group's accessible name, e.g. "Recent colors". */
  ariaLabel: string;
  /** Swatches per row; the up and down arrows move by this many. */
  columns?: number;
}

/**
 * A radio group of round color swatches. One tab stop; the arrow keys move through the grid and
 * select, like any radio group, and Home and End jump to the ends.
 */
export const ColorSwatchGrid = forwardRef<HTMLDivElement, ColorSwatchGridProps>(
  ({ options, value, onChange, ariaLabel, columns = 8, className, style, ...rest }, ref) => {
    const buttons = useRef<(HTMLButtonElement | null)[]>([]);
    const selected = options.findIndex((o) => o.value === value);
    const tabStop = selected >= 0 ? selected : 0;

    const onKeyDown = (e: React.KeyboardEvent, i: number) => {
      const target = radioKeyTarget(e.key, i, options.length, columns);
      if (target === null) return;
      e.preventDefault();
      if (target === i) return;
      buttons.current[target]?.focus();
      onChange(options[target].value);
    };

    return (
      <div
        ref={ref}
        className={cx('ps-color-swatch-grid', className)}
        role="radiogroup"
        aria-label={ariaLabel}
        style={{ '--ps-color-swatch-columns': columns, ...style } as React.CSSProperties}
        {...rest}
      >
        {options.map((o, i) => {
          const checked = i === selected;
          return (
            <button
              key={o.value}
              ref={(el) => { buttons.current[i] = el; }}
              type="button"
              role="radio"
              aria-checked={checked}
              aria-label={o.label}
              title={o.label}
              tabIndex={i === tabStop ? 0 : -1}
              className={cx('ps-color-swatch', checked && 'is-selected')}
              style={{ '--ps-color-swatch-fill': o.color, '--ps-color-swatch-ink': o.onColor } as React.CSSProperties}
              onClick={() => onChange(o.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {checked && <IconCheck size={18} strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    );
  }
);
ColorSwatchGrid.displayName = 'ColorSwatchGrid';
