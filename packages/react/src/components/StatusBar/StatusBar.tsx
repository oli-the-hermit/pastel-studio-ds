import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';
import { useTooltip } from '../Tooltip';

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

export interface StatusCountProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** A small icon for the kind that is counted: a video, an image, a file. */
  icon: React.ReactNode;
  /** The number as it reads: "1,204". */
  children: React.ReactNode;
  /** The whole fact in words, for screen readers and the tooltip: "1,204 videos". */
  label: string;
}

/**
 * A count in a StatusBar said with an icon: the icon, then the number. Several in a row tell what
 * a folder holds at a glance ("▶ 12  ▧ 340  ▯ 3"). Its words are read out in place of the icon,
 * and shown as a tooltip.
 */
export const StatusCount = ({ icon, children, label, className, ...rest }: StatusCountProps) => {
  const tip = useTooltip({ label });
  return (
    <span ref={tip.ref} className={cx('ps-status-count', className)} {...rest}>
      <span className="ps-status-count-icon" aria-hidden="true">{icon}</span>
      <span aria-hidden="true">{children}</span>
      <span className="ps-visually-hidden">{label}</span>
      {tip.element}
    </span>
  );
};
