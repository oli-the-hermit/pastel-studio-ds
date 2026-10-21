import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface ModalFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  /** `div` when the dialog saves through its own buttons instead of a submit. */
  as?: 'form' | 'div';
}

/** The column of fields inside a dialog. A `<form>` by default. */
export const ModalForm = forwardRef<HTMLElement, ModalFormProps>(({ as = 'form', className, ...rest }, ref) => {
  const cls = cx('ps-modal-form', className);
  if (as === 'div') return <div ref={ref as React.Ref<HTMLDivElement>} className={cls} {...(rest as React.HTMLAttributes<HTMLDivElement>)} />;
  return <form ref={ref as React.Ref<HTMLFormElement>} className={cls} {...rest} />;
});
ModalForm.displayName = 'ModalForm';

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `pair` two equal columns; `emoji` a narrow emoji button, then a wide field. */
  variant?: 'pair' | 'emoji';
  /** Extra space above, to set it apart from the field before (not needed inside a ModalForm). */
  spaced?: boolean;
}

/** Two fields side by side. */
export const FormRow = forwardRef<HTMLDivElement, FormRowProps>(({ variant = 'pair', spaced = false, className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-form-row', variant === 'emoji' && 'ps-form-row--emoji', spaced && 'is-spaced', className)} {...rest} />
));
FormRow.displayName = 'FormRow';

export interface SubformProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  /** A small action at the right of the title, e.g. a TextButton. */
  action?: React.ReactNode;
}

/** A form nested inside a field, on its own tinted panel: a new reward inside a session's form. */
export const Subform = forwardRef<HTMLDivElement, SubformProps>(({ title, action, className, children, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-subform', className)} {...rest}>
    <div className="ps-subform-head">
      <span className="ps-subform-title">{title}</span>
      {action}
    </div>
    {children}
  </div>
));
Subform.displayName = 'Subform';
