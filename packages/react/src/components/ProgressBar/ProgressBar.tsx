import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

/** Where the work is: begun with no amount yet, under way, done, or stopped by an error. */
export type ProgressStatus = 'starting' | 'processing' | 'completed' | 'failed';

export interface ProgressBarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** 0–100; values outside are clamped. Not shown while `starting`; a completed bar is full. */
  value?: number;
  /** Where the work is: `starting` (no amount yet), `processing`, `completed` or `failed`. */
  status?: ProgressStatus;
  /** `lg` for the main progress on a card. */
  size?: 'md' | 'lg';
  /** Accessible name, e.g. "Session progress". */
  label?: string;
  /** The fill's color while processing: `warning` or `danger` for a level running high, such as a nearly full drive. */
  tone?: 'accent' | 'warning' | 'danger';
}

/**
 * A horizontal progress track. The track sits one tonal step above its container; set
 * --ps-progress-bar-track on its class to change it.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value = 0, status = 'processing', size = 'md', label, tone = 'accent', className, ...rest }, ref) => {
    const pct = status === 'completed' ? 100 : Math.min(100, Math.max(0, value));
    const starting = status === 'starting';
    return (
      <div
        ref={ref}
        className={cx('ps-progress-bar', size === 'lg' && 'ps-progress-bar--lg', tone !== 'accent' && `ps-progress-bar--${tone}`, status !== 'processing' && `is-${status}`, className)}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={starting ? undefined : Math.round(pct)}
        {...rest}
      >
        {starting ? (
          <>
            <div className="ps-progress-bar-sweep" data-ps-keep-motion="" />
            <div className="ps-progress-bar-sweep" />
          </>
        ) : (
          <div className="ps-progress-bar-fill" style={{ width: `${pct}%` }} />
        )}
      </div>
    );
  }
);
ProgressBar.displayName = 'ProgressBar';
