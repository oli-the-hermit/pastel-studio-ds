import React, { forwardRef } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { ActionRow } from '../ActionRow';
import { Button } from '../Button';

export interface FormActionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The form differs from what it opened with. */
  dirty: boolean;
  /** Shown only while dirty; "Cancel" by default. */
  cancelLabel?: string;
  onCancel: () => void;
  primaryLabel: string;
  primaryDisabled?: boolean;
  /** Leave it out for a submit button inside a `<form>`. */
  onPrimary?: () => void;
  /** Something at the left, e.g. a destructive action. */
  leading?: React.ReactNode;
  labels?: LabelOverrides<'cancel'>;
}

/**
 * The footer every form dialog shares: the main action at the right, and Cancel, which appears
 * only once something was edited. An untouched form closes with the dialog's X.
 */
export const FormActions = forwardRef<HTMLDivElement, FormActionsProps>(({
  dirty, cancelLabel, onCancel, primaryLabel, primaryDisabled, onPrimary, leading, labels: ownLabels, className, ...rest
}, ref) => {
  const labels = useLabels(ownLabels);
  return (
    <ActionRow ref={ref} className={cx('ps-form-actions', className)} {...rest}>
      {leading && <div className="ps-form-actions-leading">{leading}</div>}
      {dirty && <Button className="ps-form-actions-cancel" onClick={onCancel}>{cancelLabel ?? labels.cancel}</Button>}
      <Button variant="primary" type={onPrimary ? 'button' : 'submit'} disabled={primaryDisabled} onClick={onPrimary}>
        {primaryLabel}
      </Button>
    </ActionRow>
  );
});
FormActions.displayName = 'FormActions';
