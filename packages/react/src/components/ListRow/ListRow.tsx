import React, { forwardRef, useId } from 'react';
import { IconChevronRight, IconExternal } from '../../icons';
import { cx } from '../../lib/cx';

export interface ListRowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  icon: React.ReactNode;
  title: string;
  description?: string;
  /** Opens something outside the app: an external-link mark instead of the chevron. */
  external?: boolean;
}

/** A row in a list of destinations, such as a Help page: icon, title, description, then a chevron. From Pastel Espresso. */
export const ListRow = forwardRef<HTMLButtonElement, ListRowProps>(({ icon, title, description, external = false, className, type = 'button', ...rest }, ref) => {
  const id = useId();
  // The title names the row; the description describes it, read after the name.
  return (
    <button ref={ref} type={type} className={cx('ps-list-row', className)} aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined} {...rest}>
      <span className="ps-list-row-icon" aria-hidden="true">{icon}</span>
      <span className="ps-list-row-text">
        <span id={`${id}-title`} className="ps-list-row-title">{title}</span>
        {description && <span id={`${id}-description`} className="ps-list-row-description">{description}</span>}
      </span>
      <span className="ps-list-row-trail" aria-hidden="true">{external ? <IconExternal size={16} /> : <IconChevronRight size={18} />}</span>
    </button>
  );
});
ListRow.displayName = 'ListRow';
