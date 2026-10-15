import React, { forwardRef, useId } from 'react';
import { cx } from '../../lib/cx';

export interface FieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The field's name, above the control. */
  label: React.ReactNode;
  /** Small muted text after the label, e.g. "Optional". */
  labelHint?: React.ReactNode;
  /** Muted help under the control. Hidden while there is an `error`. */
  hint?: React.ReactNode;
  /** What's wrong with the value and how to fix it, under the control. The control gets a red ring. */
  error?: React.ReactNode;
  /**
   * Id of the control the label points at. When omitted and the only child is a TextInput or
   * TextArea, Field gives it an id and wires the label, hint and error to it.
   */
  htmlFor?: string;
  /** The label names a group of controls (chips, options): rendered as text, not a `<label>`. */
  group?: boolean;
  /** Extra space above, to separate it from the field before. */
  spaced?: boolean;
  children: React.ReactNode;
}

/** A label above a control, with optional help or an error under it: the unit of every form. */
export const Field = forwardRef<HTMLDivElement, FieldProps>(
  ({ label, labelHint, hint, error, htmlFor, group = false, spaced = false, className, children, ...rest }, ref) => {
    const autoId = useId();
    let controlId = htmlFor;
    let content = children;

    const only = React.Children.count(children) === 1 ? React.Children.only(children) : null;
    const wired = !group && React.isValidElement<TextInputProps>(only) && (only.type === TextInput || only.type === TextArea);
    if (wired && !htmlFor) controlId = only.props.id ?? autoId;
    const noteId = controlId ? `${controlId}-${error ? 'error' : 'hint'}` : undefined;
    const note = error ?? hint;

    if (wired) {
      content = React.cloneElement(only, {
        id: controlId,
        'aria-describedby': cx(only.props['aria-describedby'], note ? noteId : undefined) || undefined,
        'aria-invalid': error ? true : only.props['aria-invalid'],
      });
    }

    const labelContent = (
      <>
        {label}
        {labelHint && <> <span className="ps-field-label-hint">{labelHint}</span></>}
      </>
    );

    return (
      <div ref={ref} className={cx('ps-field', spaced && 'ps-field--spaced', className)} {...rest}>
        {group ? (
          <span className="ps-field-label">{labelContent}</span>
        ) : (
          <label className="ps-field-label" htmlFor={controlId}>{labelContent}</label>
        )}
        {content}
        {error ? <FormError id={noteId}>{error}</FormError> : hint && <FormHint id={noteId}>{hint}</FormHint>}
      </div>
    );
  }
);
Field.displayName = 'Field';

export type TextInputProps = React.InputHTMLAttributes<HTMLInputElement>;

/** A single-line text field. Defaults to `type="text"`. */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ className, type = 'text', ...rest }, ref) => (
  <input ref={ref} type={type} className={cx('ps-input', className)} {...rest} />
));
TextInput.displayName = 'TextInput';

export type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/** A multi-line text field that the user can make taller. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ className, ...rest }, ref) => (
  <textarea ref={ref} className={cx('ps-input', 'ps-input--area', className)} {...rest} />
));
TextArea.displayName = 'TextArea';

/** Muted help text in a form, for a note that belongs to no single field. */
export const FormHint = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...rest }, ref) => (
  <p ref={ref} className={cx('ps-field-hint', className)} {...rest} />
));
FormHint.displayName = 'FormHint';

/** A problem with what was entered, announced to screen readers. Say how to fix it. */
export const FormError = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(({ className, ...rest }, ref) => (
  <p ref={ref} className={cx('ps-field-error', className)} role="alert" {...rest} />
));
FormError.displayName = 'FormError';
