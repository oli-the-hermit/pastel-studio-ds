import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked' | 'onChange'> {
  /** The setting's name, on the left of the row. */
  label: React.ReactNode;
  /** Muted text under the label. */
  hint?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** `row` a tonal settings row; `inline` a small switch with its label beside it, for a toolbar or a dialog's footer. */
  layout?: 'row' | 'inline';
}

/**
 * A settings row: the label and hint on the left, the on/off toggle on the right. The whole
 * row is clickable. The ref and other attributes go to the toggle; `className` to the row.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ label, hint, checked, onChange, layout = 'row', className, ...rest }, ref) => (
  <label className={cx('ps-switch', layout === 'inline' && 'ps-switch--inline', className)}>
    <span className="ps-switch-text">
      <span className="ps-switch-title">{label}</span>
      {hint && <span className="ps-switch-hint">{hint}</span>}
    </span>
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      className="ps-switch-toggle"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      {...rest}
    />
  </label>
));
Switch.displayName = 'Switch';
