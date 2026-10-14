import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

/** A tonal surface that groups related content. */
export const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-card', className)} {...rest} />
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
  /** A short label, shown in capitals. */
  title: React.ReactNode;
  /** Usually a small tonal button. */
  action?: React.ReactNode;
}

/** A compact header for side panels: an uppercase label and one optional action. */
export const PanelHeader = forwardRef<HTMLDivElement, PanelHeaderProps>(({ title, action, className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-panel-header', className)} {...rest}>
    <span className="ps-panel-header-title">{title}</span>
    {action}
  </div>
));
PanelHeader.displayName = 'PanelHeader';
