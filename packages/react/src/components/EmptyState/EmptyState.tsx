import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** `sm` for empty lists inside panels. */
  size?: 'md' | 'sm';
  /** A large, quiet picture above the words: an icon for what is missing, or a `Spinner` while it loads. */
  icon?: React.ReactNode;
  /** The one line that says what is missing. `children` then say why, or what to do about it. */
  title?: React.ReactNode;
}

/**
 * A centered, muted message for a list or a view with nothing to show yet. On its own it is one
 * line of text; with `icon` and `title` it is a small figure: the picture, what is missing, and
 * under it the reason or the way out (a sentence, a button).
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(({ size = 'md', icon, title, className, children, ...rest }, ref) => {
  const figure = icon != null || title != null;
  const text = children != null && children !== false && children !== '';
  return (
    <div ref={ref} className={cx('ps-empty-state', size === 'sm' && 'ps-empty-state--sm', className)} {...rest}>
      {icon != null && <span className="ps-empty-state-icon">{icon}</span>}
      {title != null && <p className="ps-empty-state-title">{title}</p>}
      {figure ? text && <div className="ps-empty-state-text">{children}</div> : children}
    </div>
  );
});
EmptyState.displayName = 'EmptyState';
