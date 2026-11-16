import React, { forwardRef, useId, useState } from 'react';
import { IconEye, IconEyeOff } from '../../icons';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { Field, TextInput } from '../Field';
import { IconButton } from '../IconButton';

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange' | 'size'> {
  /** The field's name, above it: "Password", "New password". */
  label: React.ReactNode;
  /** Small muted text after the label, e.g. "Optional". */
  labelHint?: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** Muted help under the field, e.g. how long it must be. Hidden while there is an `error`. */
  hint?: React.ReactNode;
  /** What's wrong with the password and how to fix it. The field gets a red ring. */
  error?: React.ReactNode;
  /** Extra space above, to separate it from the field before. */
  spaced?: boolean;
  /** Start with the password shown, e.g. one the app just made up. Hidden by default. */
  defaultShown?: boolean;
  /** Class of the whole field (the label, the input and the note under it). */
  className?: string;
  labels?: LabelOverrides<'showPassword' | 'hidePassword'>;
}

/**
 * A password with its label, and a button at its end that shows what was typed and hides it
 * again. Hidden to start with, unless `defaultShown`. Set `autoComplete` (`current-password` or
 * `new-password`) so password managers know which it is.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ label, labelHint, value, onChange, hint, error, spaced, defaultShown = false, className, labels: ownLabels, id, disabled, 'aria-describedby': describedBy, ...input }, ref) => {
    const labels = useLabels(ownLabels);
    const autoId = useId();
    const inputId = id ?? autoId;
    const [shown, setShown] = useState(defaultShown);
    const note = error ?? hint;
    return (
      <Field label={label} labelHint={labelHint} hint={hint} error={error} spaced={spaced} htmlFor={inputId} className={cx('ps-password-field', className)}>
        <div className="ps-password-field-control">
          <TextInput
            {...input}
            ref={ref}
            id={inputId}
            type={shown ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="ps-password-field-input"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-describedby={cx(describedBy, note ? `${inputId}-${error ? 'error' : 'hint'}` : undefined) || undefined}
            aria-invalid={error ? true : input['aria-invalid']}
          />
          <IconButton
            size="sm"
            surface={2}
            className="ps-password-field-toggle"
            label={shown ? labels.hidePassword : labels.showPassword}
            aria-controls={inputId}
            disabled={disabled}
            onClick={() => setShown((s) => !s)}
          >
            {shown ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </IconButton>
        </div>
      </Field>
    );
  }
);
PasswordField.displayName = 'PasswordField';
