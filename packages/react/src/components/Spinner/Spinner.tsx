import React, { forwardRef } from 'react';
import { useLabels, type LabelOverrides } from '../../labels';
import { cx } from '../../lib/cx';

export interface SpinnerProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'role'> {
  /** `lg` the size of a player control, for a player that is buffering. */
  size?: 'md' | 'lg';
  labels?: LabelOverrides<'loading'>;
}

/** A turning arc: something is loading or buffering and will be ready soon. */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(({ size = 'md', labels: ownLabels, className, ...rest }, ref) => {
  const labels = useLabels(ownLabels);
  return (
    <span ref={ref} className={cx('ps-spinner', size === 'lg' && 'ps-spinner--lg', className)} role="status" aria-label={labels.loading} {...rest}>
      <svg viewBox="0 0 48 48" aria-hidden="true" data-ps-keep-motion="">
        <circle className="ps-spinner-track" cx="24" cy="24" r="20" />
        <circle className="ps-spinner-arc" cx="24" cy="24" r="20" pathLength="100" />
      </svg>
    </span>
  );
});
Spinner.displayName = 'Spinner';
