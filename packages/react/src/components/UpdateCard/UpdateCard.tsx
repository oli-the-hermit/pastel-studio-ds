import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface UpdateCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** "Version 1.4.0 is ready". Also names the card for screen readers when it is text. */
  title: React.ReactNode;
  /** The tile at the left, usually a sparkle. */
  icon?: React.ReactNode;
  /** The text under the title and any status, e.g. a progress bar while it downloads. */
  children?: React.ReactNode;
  /** The buttons at the bottom: Later, Install. Leave them out while it works. */
  actions?: React.ReactNode;
}

/**
 * The card that offers an update in the corner of the window. It only draws: the app checks,
 * downloads and installs, and decides when to show it (never while a timer runs).
 */
export const UpdateCard = forwardRef<HTMLElement, UpdateCardProps>(({ title, icon, children, actions, className, ...rest }, ref) => (
  <aside ref={ref} className={cx('ps-update-card', className)} aria-label={typeof title === 'string' ? title : undefined} {...rest}>
    {icon && <span className="ps-update-card-icon" aria-hidden="true">{icon}</span>}
    <div className="ps-update-card-text">
      <div className="ps-update-card-title">{title}</div>
      {children}
      {actions && <div className="ps-update-card-actions">{actions}</div>}
    </div>
  </aside>
));
UpdateCard.displayName = 'UpdateCard';
