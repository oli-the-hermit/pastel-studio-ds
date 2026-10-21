import React, { forwardRef } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';
import { ActionRow } from '../ActionRow';
import { Button } from '../Button';

export interface ConfirmModalProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** The question, and what follows if the answer is yes. */
  message: React.ReactNode;
  /** The danger action's word; "Delete" by default. */
  confirmLabel?: string;
  onConfirm: () => void;
  /** Called after confirming, and on Cancel. */
  onClose: () => void;
  labels?: LabelOverrides<'cancel' | 'delete'>;
}

/** The body of a confirm dialog, inside a Modal: the question, then Cancel and the danger action, which has focus. */
export const ConfirmModal = forwardRef<HTMLDivElement, ConfirmModalProps>(({ message, confirmLabel, onConfirm, onClose, labels: ownLabels, className, ...rest }, ref) => {
  const labels = useLabels(ownLabels);
  return (
    <div ref={ref} className={cx('ps-confirm-modal', className)} {...rest}>
      <p className="ps-confirm-modal-message">{message}</p>
      <ActionRow>
        <Button onClick={onClose}>{labels.cancel}</Button>
        <Button
          variant="danger"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          autoFocus
        >
          {confirmLabel ?? labels.delete}
        </Button>
      </ActionRow>
    </div>
  );
});
ConfirmModal.displayName = 'ConfirmModal';
