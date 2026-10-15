import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  /** The element: `section`, `aside` or `article` make it a landmark or a self-contained item. */
  as?: 'div' | 'section' | 'aside' | 'article';
  /** `md` 24px (default), `sm` 16px, `none` for content that reaches the edges, like a list with its own padding. */
  padding?: 'md' | 'sm' | 'none';
}

/** A tonal surface that groups related content. */
export const Card = forwardRef<HTMLElement, CardProps>(({ as: Tag = 'div', padding = 'md', className, ...rest }, ref) => (
  <Tag ref={ref as React.Ref<HTMLDivElement>} className={cx('ps-card', padding !== 'md' && `ps-card--pad-${padding}`, className)} {...rest} />
));
Card.displayName = 'Card';

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** The card's name, shown as a heading on one line. */
  title: React.ReactNode;
  /** Tooltip for the title, which truncates with an ellipsis. */
  titleTooltip?: string;
  /** Small uppercase line above the title. */
  overline?: React.ReactNode;
  /** Right after the title, on its line (e.g. a count chip). */
  titleAddon?: React.ReactNode;
  /** Chips or meta shown under the title. */
  subtitle?: React.ReactNode;
  /** Icon buttons on the right, grouped tightly. */
  actions?: React.ReactNode;
  /** Anything else on the right, unwrapped (e.g. a status chip). */
  aside?: React.ReactNode;
}

/** A card's large header: a title (with an optional overline and subtitle row) and trailing actions. */
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, titleTooltip, overline, titleAddon, subtitle, actions, aside, className, ...rest }, ref) => {
    const heading = <h2 className="ps-card-title" title={titleTooltip}>{title}</h2>;
    return (
      <div ref={ref} className={cx('ps-card-header', className)} {...rest}>
        <div className="ps-card-header-main">
          {overline && <span className="ps-overline">{overline}</span>}
          {titleAddon ? (
            <div className="ps-card-title-row">
              {heading}
              {titleAddon}
            </div>
          ) : heading}
          {subtitle && <div className="ps-card-subtitle-row">{subtitle}</div>}
        </div>
        {aside}
        {actions && <div className="ps-card-header-actions">{actions}</div>}
      </div>
    );
  }
);
CardHeader.displayName = 'CardHeader';

export interface PanelHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  /** A short label, shown in capitals; a heading for screen readers. */
  title: React.ReactNode;
  /** Usually a small tonal button. */
  action?: React.ReactNode;
  /** An id for the heading, so the panel can be named by it (`aria-labelledby`). */
  titleId?: string;
}

/** A compact header for side panels: an uppercase heading and one optional action. */
export const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(({ title, action, titleId, className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-panel-header', className)} {...rest}>
    <h2 className="ps-panel-header-title" id={titleId}>{title}</h2>
    {action}
  </div>
));
PanelHeader.displayName = 'PanelHeader';
