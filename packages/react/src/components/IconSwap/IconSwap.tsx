import React, { forwardRef } from 'react';
import { cx } from '../../lib/cx';

export interface IconSwapProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Which icon shows; flipping it plays the swap. */
  on: boolean;
  /** Shown while `on`, e.g. pause while playing. */
  onIcon: React.ReactNode;
  /** Shown while off, e.g. play while paused. */
  offIcon: React.ReactNode;
}

/**
 * Two stacked icons that cross-fade (with a small turn and scale) when `on` flips, instead
 * of snapping. Used for play/pause and sound on/off. Decorative: the button around it names
 * the action.
 */
export const IconSwap = forwardRef<HTMLSpanElement, IconSwapProps>(({ on, onIcon, offIcon, className, ...rest }, ref) => (
  <span ref={ref} className={cx('ps-icon-swap', on ? 'is-on' : 'is-off', className)} aria-hidden="true" {...rest}>
    <span className="ps-icon-swap-on">{onIcon}</span>
    <span className="ps-icon-swap-off">{offIcon}</span>
  </span>
));
IconSwap.displayName = 'IconSwap';
