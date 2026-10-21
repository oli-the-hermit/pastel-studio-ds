import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface StatusChipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** `live` something running (the dot pulses in the accent), `paused` held (amber), `idle` nothing going on. */
  tone: 'idle' | 'live' | 'paused';
  label: string;
  /** A live value after the label, e.g. the countdown or the time played. */
  value?: React.ReactNode;
  /** Pressing the chip, e.g. go to the timer or the player. */
  onOpen: () => void;
  /** The chip's tooltip, e.g. where it leads. */
  openTitle?: string;
  /** A round action at the end, e.g. play or pause. */
  action?: { label: string; icon: React.ReactNode; onClick: () => void };
}

/**
 * A pill that shows a live status in the top bar: a dot, a label, an optional value and a small
 * action. Its colors are custom properties on its class (`--ps-status-dot`, `--ps-status-value`),
 * so an app can add a tone of its own, such as Focus Space's break.
 */
export const StatusChip = forwardRef<HTMLDivElement, StatusChipProps>(({ tone, label, value, onOpen, openTitle, action, className, ...rest }, ref) => (
  <div ref={ref} className={cx('ps-status-chip', `ps-status-chip--${tone}`, className)} {...rest}>
    <button type="button" className="ps-status-chip-main" onClick={onOpen} title={openTitle}>
      <span className="ps-status-chip-dot" aria-hidden="true" />
      <span className="ps-status-chip-label">{label}</span>
      {value !== undefined && <span className="ps-status-chip-value">{value}</span>}
    </button>
    {action && (
      <button type="button" className="ps-status-chip-action" onClick={action.onClick} aria-label={action.label} title={action.label}>
        {action.icon}
      </button>
    )}
  </div>
));
StatusChip.displayName = 'StatusChip';
