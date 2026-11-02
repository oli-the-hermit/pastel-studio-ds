import React, { forwardRef, useEffect, useRef } from 'react';
import { cx } from '../../lib/cx';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Some but not all of what it stands for is checked: a dash. Checking it checks all. */
  mixed?: boolean;
}

/**
 * A square check box, recessed into the row it sits on: a filled square a step darker than its
 * surface, with a thin ring so its edge stays visible; checked, it fills with the accent and a
 * check; mixed, with a dash. Without a visible label, give it an `aria-label` naming what it
 * checks off.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, onChange, mixed = false, ...rest }, ref) => {
  const own = useRef<HTMLInputElement | null>(null);
  // The mixed state exists only as a DOM property; the browser reads it out as "mixed".
  useEffect(() => {
    if (own.current) own.current.indeterminate = mixed;
  }, [mixed]);
  return (
    <input
      ref={(node) => {
        own.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      type="checkbox"
      className={cx('ps-checkbox', className)}
      onChange={(e) => onChange(e.target.checked)}
      {...rest}
    />
  );
});
Checkbox.displayName = 'Checkbox';
