import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * A square check box, recessed into the row it sits on: a filled square a step darker than its
 * surface, with a thin ring so its edge stays visible; checked, it fills with the accent and a
 * check. Without a visible label, give it an `aria-label` naming what it checks off.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ className, onChange, ...rest }, ref) => (
  <input ref={ref} type="checkbox" className={cx('ps-checkbox', className)} onChange={(e) => onChange(e.target.checked)} {...rest} />
));
Checkbox.displayName = 'Checkbox';
