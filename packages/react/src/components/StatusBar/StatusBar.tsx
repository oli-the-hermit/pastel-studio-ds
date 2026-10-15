import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface StatusBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** On the left: "24 items", "3 selected · 4.2 MB". Read out politely when it changes. */
  children: React.ReactNode;
  /** On the right: a view switch, a zoom. */
  end?: React.ReactNode;
}

/** A quiet line under a view: counts on the left, view controls on the right. */
export const StatusBar = forwardRef<HTMLDivElement, StatusBarProps>(({ children, end, className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-status-bar', className)} {...rest}>
    <span className="ps-status-bar-text" role="status">{children}</span>
    {end && <span className="ps-status-bar-end">{end}</span>}
  </div>
));
StatusBar.displayName = 'StatusBar';
