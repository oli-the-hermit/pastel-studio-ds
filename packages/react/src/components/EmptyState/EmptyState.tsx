import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `sm` for empty lists inside panels. */
  size?: 'md' | 'sm';
}

/** A centered, muted message for a list or a view with nothing to show yet. */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(({ size = 'md', className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-empty-state', size === 'sm' && 'ps-empty-state--sm', className)} {...rest} />
));
EmptyState.displayName = 'EmptyState';
